import pandas as pd 
import numpy as np 
from typing import Dict, List, Tuple, Any
from datetime import datetime as dt, time as time_type, timedelta
from pathlib import Path 
import json 

class GlucoseDataProcessor: 
    def __init__(self, filepath: str, output_dir: str = "./data/processed"):
        self.filepath = filepath
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.df = None 
        self.meals = []
        self.glucose_sequences = [] 

    def load_and_clean(self) -> pd.DataFrame:
        print("Loading Excel file...")

        df = pd.read_excel(
            self.filepath,
            sheet_name='Stelo Blood Glucose Monitor Rec',
            header=1
        )
        # Keep only essential columns
        df = df[['Date', 'Time', 'Carb Intake (g)', 'Glucose', 'Activity', 'Food Intake or Glucose Trend Status']].copy()
        print(f"Loaded {len(df)} rows")

        def extract_date(x):
            if isinstance(x, dt):
                return x.date()
            return None 
        df['date_part'] = df['Date'].apply(extract_date)
        df['date_part'] = df['date_part'].ffill()

        def extract_time(x):
            if isinstance(x, time_type):
                return x
            return None
        df['time_part'] = df['Time'].apply(extract_time) 

        def make_datetime(row):
            if pd.notna(row['date_part']) and row['time_part'] is not None:
                try:
                    return pd.Timestamp(
                        year=row['date_part'].year,
                        month=row['date_part'].month,
                        day=row['date_part'].day,
                        hour=row['time_part'].hour,
                        minute=row['time_part'].minute,
                        second=row['time_part'].second
                    )
                except:
                    return pd.NaT
            return pd.NaT
        
        df['DateTime'] = df.apply(make_datetime, axis=1) 
        df['Glucose_numeric'] = pd.to_numeric(df['Glucose'], errors='coerce')
        df['Carbs_numeric'] = pd.to_numeric(df['Carb Intake (g)'], errors='coerce')
        df = df.sort_values('DateTime').reset_index(drop=True)
        self.df = df 
        print(f"After cleaning: {len(df)} rows with valid datetime")
        print(f"  - With glucose readings: {df['Glucose_numeric'].notna().sum()}")
        print(f"  - With carb entries: {df['Carbs_numeric'].notna().sum()}")
        if len(df) > 0:
            print(f"  - Date range: {df['DateTime'].min()} to {df['DateTime'].max()}")
        
        return df

    def extract_meals(self) -> List[Dict[str, Any]]:
        print("\nExtracting meals...")

        meals = []
        meal_rows = self.df[self.df['Carbs_numeric'].notna()].copy()

        for idx, row in meal_rows.iterrows():
            carbs = row['Carbs_numeric']
            if carbs <= 0:
                continue 
            dt_val = row['DateTime']

            # Find closest glucose reading (±30 min)
            time_diff = (self.df['DateTime'] - dt_val).abs()
            closest_idx = time_diff.idxmin()  
            closest_diff_minutes = time_diff.min().total_seconds() / 60

            if closest_diff_minutes > 30:
                continue 
            closest_glucose = self.df.loc[closest_idx, 'Glucose_numeric']
            if pd.isna(closest_glucose):
                continue 
            
            meal = {
                'datetime': dt_val,
                'hour': dt_val.hour + dt_val.minute / 60,
                'carbs': carbs,
                'activity': row['Activity'] if pd.notna(row['Activity']) else 'unknown',
                'food_description': row['Food Intake or Glucose Trend Status'] if pd.notna(row['Food Intake or Glucose Trend Status']) else '',
                'meal_index': idx,
                'closest_glucose_index': closest_idx  
            }
            meals.append(meal)
        
        self.meals = meals 
        print(f"Extracted {len(meals)} meals with nearby glucose readings")
        return meals 

    def create_glucose_sequences(  
        self,
        sequence_duration_minutes: int = 180,  
        min_readings_per_sequence: int = 5,    
    ) -> List[Dict[str, Any]]:
        print(f"\nCreating glucose sequences (duration: {sequence_duration_minutes} min)...")

        sequences = []

        for meal in self.meals:
            meal_datetime = meal['datetime']
            closest_glucose_idx = meal['closest_glucose_index'] 
            baseline_glucose = self.df.loc[closest_glucose_idx, 'Glucose_numeric']  
            seq_end = meal_datetime + timedelta(minutes=sequence_duration_minutes)
            
            mask = (self.df['DateTime'] >= meal_datetime) & \
                   (self.df['DateTime'] <= seq_end) & \
                   (self.df['Glucose_numeric'].notna())
            seq_data = self.df[mask].copy()

            # Must have enough readings 
            if len(seq_data) < min_readings_per_sequence:
                continue 
            
            # Calculate time from meal start (minutes)
            times_from_meal = (seq_data['DateTime'] - meal_datetime).dt.total_seconds() / 60  
            glucose_values = seq_data['Glucose_numeric'].values  

            peak_idx = np.argmax(glucose_values)
            peak_glucose = glucose_values[peak_idx]
            time_to_peak = times_from_meal.iloc[peak_idx]

            sequence = {
                'meal': meal,
                'glucose_times': times_from_meal.values,
                'glucose_values': glucose_values,
                'baseline_glucose': float(baseline_glucose),
                'peak_glucose': float(peak_glucose),
                'time_to_peak': float(time_to_peak),
                'num_readings': len(glucose_values),
                'valid': True
            }
            sequences.append(sequence)
        
        self.glucose_sequences = sequences
        print(f"Created {len(sequences)} valid glucose sequences")
        return sequences

    def extract_meal_features(self, meal: Dict) -> Dict[str, float]:
        carbs = meal['carbs']
        hour = meal['hour']

        activity_map = {
            'sedentary': 0.0,
            'light': 0.2,
            'moderate': 0.5,
            'vigorous': 0.8,
            'unknown': 0.1
        }
        activity_level = activity_map.get(
            meal['activity'].lower().strip() if meal['activity'] else 'unknown', 
            0.1
        )
        food_desc = meal['food_description'].lower()
        is_liquid = any(word in food_desc for word in ['soup', 'juice', 'smoothie', 'milk', 'drink'])
        fiber_ratio = 0.1 if is_liquid else 0.15 
        fatprotein = 0.3 
        
        return {
            'carbs': carbs,
            'hour': hour,
            'is_liquid': float(is_liquid),
            'fiber_ratio': fiber_ratio,
            'fatprotein': fatprotein,
            'activity_level': activity_level
        }

    def prepare_training_data(self) -> Tuple[List[Dict], List[Dict]]:
        print(f"\nPreparing training data...")
        
        meal_features = []
        glucose_seqs = []

        for seq in self.glucose_sequences:
            meal = seq['meal']
            features = self.extract_meal_features(meal)
            meal_features.append(features)

            seq_data = {
                'glucose_times': seq['glucose_times'].tolist(),
                'glucose_values': seq['glucose_values'].tolist(),
                'baseline_glucose': float(seq['baseline_glucose']),
                'peak_glucose': float(seq['peak_glucose']),
                'time_to_peak': float(seq['time_to_peak'])
            }
            glucose_seqs.append(seq_data)
        
        print(f"Prepared {len(meal_features)} training examples")
        return meal_features, glucose_seqs

    def create_train_val_test_split(
        self,
        train_ratio: float = 0.7, 
        val_ratio: float = 0.15,
        test_ratio: float = 0.15,
        random_seed: int = 42
    ) -> Tuple[Dict, Dict, Dict]:
        print(f"\nCreating train/val/test split ({train_ratio}/{val_ratio}/{test_ratio})...")
        
        n = len(self.glucose_sequences)
        indices = np.arange(n)  

        train_end = int(n * train_ratio)
        val_end = train_end + int(n * val_ratio)
        train_idx = indices[:train_end]
        val_idx = indices[train_end:val_end]
        test_idx = indices[val_end:]

        meal_features, glucose_seqs = self.prepare_training_data()
        
        def make_split(idx_list):
            return { 
                'meal_features': [meal_features[i] for i in idx_list],
                'glucose_sequences': [glucose_seqs[i] for i in idx_list],
                'indices': idx_list.tolist()
            }
        
        train = make_split(train_idx)
        val = make_split(val_idx)
        test = make_split(test_idx)

        print(f"Train: {len(train_idx)} | Val: {len(val_idx)} | Test: {len(test_idx)}")
        return train, val, test 

    def save_processed_data(self, train: Dict, val: Dict, test: Dict): 
        print("\nSaving processed data...")
        
        with open(self.output_dir / 'train.json', 'w') as f:
            json.dump(train, f, indent=2)
        with open(self.output_dir / 'val.json', 'w') as f:
            json.dump(val, f, indent=2)
        with open(self.output_dir / 'test.json', 'w') as f:
            json.dump(test, f, indent=2)
        
        # Save metadata 
        carbs_list = [m['carbs'] for m in self.meals] if self.meals else []
        glucose_list = self.df['Glucose_numeric'].dropna().tolist() if len(self.df) > 0 else [] 

        metadata = {
            'total_sequences': len(self.glucose_sequences),
            'total_meals': len(self.meals),
            'date_range': {
                'start': self.df['DateTime'].min().isoformat() if len(self.df) > 0 else None,
                'end': self.df['DateTime'].max().isoformat() if len(self.df) > 0 else None
            },
            'carb_statistics': {
                'min': float(np.min(carbs_list)) if carbs_list else None,
                'max': float(np.max(carbs_list)) if carbs_list else None,
                'mean': float(np.mean(carbs_list)) if carbs_list else None,
                'median': float(np.median(carbs_list)) if carbs_list else None
            } if carbs_list else {},
            'glucose_statistics': {
                'min': float(np.min(glucose_list)) if glucose_list else None,
                'max': float(np.max(glucose_list)) if glucose_list else None,
                'mean': float(np.mean(glucose_list)) if glucose_list else None,
                'median': float(np.median(glucose_list)) if glucose_list else None
            } if glucose_list else {}
        }
        with open(self.output_dir / 'metadata.json', 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Saved to {self.output_dir}")
        print(f"  - train.json ({len(train['meal_features'])} examples)")
        print(f"  - val.json ({len(val['meal_features'])} examples)")
        print(f"  - test.json ({len(test['meal_features'])} examples)")
        print(f"  - metadata.json")

    def run_full_pipeline(
        self,
        sequence_duration_minutes: int = 180,  
        min_readings_per_sequence: int = 5     
    ):
        print("=" * 60)
        print("GLUCOSE DATA PREPROCESSING PIPELINE")
        print("=" * 60)

        self.load_and_clean()
        self.extract_meals()
        self.create_glucose_sequences( 
            sequence_duration_minutes=sequence_duration_minutes,  
            min_readings_per_sequence=min_readings_per_sequence
        )

        train, val, test = self.create_train_val_test_split()
        self.save_processed_data(train, val, test) 

        print("\n" + "=" * 60)
        print("PREPROCESSING COMPLETE")
        print("=" * 60)

        return train, val, test 


def load_processed_data(data_dir: str = "./data/processed") -> Tuple[Dict, Dict, Dict]: 
    data_dir = Path(data_dir)

    with open(data_dir / 'train.json') as f: 
        train = json.load(f)
    with open(data_dir / 'val.json') as f:
        val = json.load(f)
    with open(data_dir / 'test.json') as f:
        test = json.load(f)
    
    return train, val, test 

""" this is how you'd use it 
if __name__ == "__main__":
    # Change the filepath and output_dir yourself
    processor = GlucoseDataProcessor(
        filepath="/mnt/user-data/uploads/Dexcom_Stelo_blood_glucose_readings_-_food_carbs_-_exercise_-_1_18_2026.xlsx",
        output_dir="/home/claude/data/processed"
    )
    
    train, val, test = processor.run_full_pipeline(
        sequence_duration_minutes=180,
        min_readings_per_sequence=5
    )
    """