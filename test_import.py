print("🔍 Test 1: Script started")

try:
    print("🔍 Test 2: About to import train_simple")
    from ai.training.train import train_simple
    print("🔍 Test 3: train_simple imported successfully")
except Exception as e:
    print(f"❌ Import failed: {e}")
    import traceback
    traceback.print_exc()