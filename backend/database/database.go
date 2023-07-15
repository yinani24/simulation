package database

import (
	"context"
	"mat-back/graph/model"
	// "database/sql"
	"fmt"
	"log"
	"os"
	"strconv"
	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type MongoDB struct {
	Client *mongo.Client
}

type PostSql struct {
	db *gorm.DB
}

// Database is the struct for the database.

func ConnecttoPostSql(dbname string) (PostSql, error) {
	dotenvErr := godotenv.Load()
	
	if dotenvErr != nil {
		log.Fatal("Error loading .env file")
	}

	host := os.Getenv("HOST")
	portStr := os.Getenv("PORT")
	port, err := strconv.Atoi(portStr)
	user := os.Getenv("USER")
	password := os.Getenv("PASSWORD")

	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	
	if err != nil {
		log.Fatal(err)
	}

	return PostSql{
		db: db,
	}, nil
}

//may need to rewrite this function do look through this
func MigratePostgreSQLSchema(p PostSql, models ...interface{}) error {
	db := p.db
	err := db.AutoMigrate(models...)
	if err != nil {
		return err
	}
	return nil
}

// func CreatePostgreSQLDatabase(p PostSql, databaseName string) *gorm.DB{
// 	db := p.db
// 	result := db.Exec(fmt.Sprintf("CREATE DATABASE %s", databaseName))
// 	if result.Error != nil {
// 		return nil
// 	}
// 	return result
// }

func DeletePostgreSQLDatabase(p PostSql, databaseName string) error {
	db := p.db
	result := db.Exec(fmt.Sprintf("DROP DATABASE IF EXISTS %s", databaseName))
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func ConnecttoMongoDB() (MongoDB, error) {
	// Connect to the database.
	dotenv_err := godotenv.Load()
	if dotenv_err != nil {
	  log.Fatal("Error loading .env file")
	}

	mongodb := os.Getenv("MONGODB")
	client, error := mongo.NewClient(options.Client().ApplyURI(mongodb))
	if error != nil {
		log.Fatal(error)
	}
	err := client.Ping(context.TODO(), nil)
	if err != nil {
		log.Fatal(err)
	}
	return 	MongoDB{	
		Client: client,
	}, nil
}

//InsertMongoDB inserts a query into the database
func InsertMongoDB(M MongoDB, databaseName string, collection string, ctx context.Context, query interface{})  *mongo.InsertOneResult{
	client := M.Client
	mat, err := client.Database(databaseName).Collection(collection).InsertOne(ctx, query)
	if err != nil{
		return nil
	}
	return mat
}

func DeleteMongoDB(M MongoDB, databaseName string, collection string, ctx context.Context, query interface{}) (result *mongo.DeleteResult, err error){
	client := M.Client
	result, err = client.Database(databaseName).Collection(collection).DeleteOne(ctx, query)
	return 
}

func createMatrix(post * PostSql, Mongo * MongoDB, M string) *model.Matrix{
	userpostgres, err := ConnecttoPostSql(M)
	if err != nil{
		return nil
	}
	mongodb := Mongo.Client.Database(M).Collection("blocks")
	if mongodb != nil{
		return nil
	}

	return &model.Matrix{
		ID: "1",
		Name: M,
		Userdatabase: userpostgres.db,
		Mongodatabase: mongodb,
	}
}

func createUser(mongo MongoDB, Matrix string, matrixID string, username string, email string, password string, currentbalance float64) *model.User{
	usermongodatabase := mongo.Client.Database(Matrix).Collection(`${Matrix}users`)
	if usermongodatabase != nil{
		return nil
	}
	return &model.User{
		MatrixID: matrixID,
		Email: email,
		Password: password,
		Username: username,
		CurrentBalance: 0.0,
		Usermongodatabase: usermongodatabase,
	}
}

func creatAdmin(Matrix string, matrixID string, username string, email string, password string, priviledge bool) *model.Admin{
	return &model.Admin{	
		MatrixID: matrixID,
		Email: email,
		Password: password,
		Username: username,
		Priviledge: priviledge,
	}	
}
