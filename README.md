# Simulation
Upload .env file in Backend
`touch .env`
Add these in the .env file for your local Postgre Server and MongoDB server (can be local or web based):
`
MONGODB_URI = <YOUR_URI>
host     = localhost
port     = <YOUR_POSTGRE_PORT>
user     = <YOUR_POSTGRE_USERNAME>
password = <YOUR_POSTGRE_PASSWORD>
`
Then you can run backend with 
`
go run server.go
`
and start the Frontend

