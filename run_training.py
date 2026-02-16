from ai.training.train import train_simple, GlucoseTrainer

def quick_test():
    #fast test 
    print("Runninf quick test....")
    results = train_simple(num_epochs=10)
    return results 
def standard_training():
    print("Running standard training ")
    trainer = GlucoseTrainer(model_name="glucose_v1")
    results = trainer.train(
        num_epochs=100, 
        learning_rate=0.01,
        early_stopping_patience= 10
    )
    return results 
def advanced_training():
    print("Running advanced traiign ....")
    trainer = GlucoseTrainer(model_name="glucose_advanced")
    results = trainer.train(
        num_epochs=200,
        learning_rate=0.005,
        weight_decay=1e-4,
        early_stopping_patience=15
    )
    return results 
if __name__ == "__main__":
    import sys 
    if len(sys.argv) > 1:
        mode = sys.argv[1]
    else:
        mode = "standard"
    if mode == "quick":
        results = quick_test()
    elif mode == "standard":
        results = standard_training()
    elif mode == "advanced":
        results = advanced_training()
    else:
        print(f"Unknown mode: {mode}")
        print("Usage: python run_training.py [quick|standard|advanced]")
        sys.exit(1)
    print("\n" + "="*70)
    print("TRAINING COMPLETE")
    print("="*70)
    print(f"Best Validation Loss: {results['best_val_loss']:.4f}")
    print(f"Test Loss: {results['test_loss']:.4f}")
    print(f"Epochs Trained: {results['num_epochs']}")
    print(f"Model saved to: ./checkpoints/{results['model_name']}_best.pt")
    print(f"Results saved to: ./logs/{results['model_name']}_summary.json")