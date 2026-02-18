import os 
from api.glucose_api import app

if __name__ =='__main__':
    port = int(os.getenv('PORT',5000))
    host = os.getenv('HOST','0.0.0.0')
    debug = os.getenv('DEBUG', 'True') == 'True'
    print(f"Starting Glucose Simulation API on {host}:{port}")
    print(f"Debug mode: {debug}")
    print(f"Endpoint: http://localhost:{port}/simulate-glucose")
    
    app.run(host=host, port=port, debug=debug)