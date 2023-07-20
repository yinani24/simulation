package database

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"mat-back/graph/model"
	"os"
	"strconv"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type MongoDB struct {
	Client *mongo.Client
}

type PostSql struct {
	DB *gorm.DB
}

// Make the 3 sql databases
func ConnecttoPostSql(M string) (PostSql,PostSql,PostSql) {
	dotenvErr := godotenv.Load()
	
	if dotenvErr != nil {
		log.Fatal("Error loading .env file")
	}

	host := os.Getenv("HOST")
	portStr := os.Getenv("PORT")
	user := os.Getenv("USER")
	password := os.Getenv("PASSWORD")

	//Simulation Matrix
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s sslmode=disable", host, portStr, user, password)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatal(err)
	}

	exists, error1 := CheckDatabaseExists(db, M)
	if error1 != nil {
		log.Fatal(error1)
	}
	if !exists {
		CreateDatabase(db, M)
		MigratePostgreSQLSchema(db, &model.Matrix{})
	}
	
	//User Database Created here
	dsn2 := fmt.Sprintf("host=%s port=%s user=%s password=%s sslmode=disable", host, portStr, user, password)
	db2, err2 := gorm.Open(postgres.Open(dsn2), &gorm.Config{})

	if err2 != nil {
		log.Fatal(err2)
	}
	exist2, error2 := CheckDatabaseExists(db2, "Users")
	
	fmt.Print("Exists 2 \n\n", exist2)
	
	if error2 != nil {
		log.Fatal(error2)
	}
	if !exist2 {
		CreateDatabase(db2, "Users")
		MigratePostgreSQLSchema(db2, &model.User{})
	}
	
	//Admin Database Created here
	dsn3 := fmt.Sprintf("host=%s port=%s user=%s password=%s sslmode=disable", host, portStr, user, password)
	db3, err3 := gorm.Open(postgres.Open(dsn3), &gorm.Config{})

	if err3 != nil {
		log.Fatal(err3)
	}

	exist3, error3 := CheckDatabaseExists(db3, "Admin")
	
	fmt.Print("Exists 3 \n\n", exist3)
	
	if error3 != nil {
		log.Fatal(error3)
	}
	if !exist3 {
		CreateDatabase(db3, "Admin")
		MigratePostgreSQLSchema(db3, &model.Admin{})
	}

	return PostSql{
		DB: db,
	}, PostSql{
		DB: db2,
	}, PostSql{
		DB: db3,
	}
}

//may need to rewrite this function do look through this
func MigratePostgreSQLSchema(db * gorm.DB, models ...interface{}) error {
	err := db.AutoMigrate(models...)
	if err != nil {
		return err
	}
	return nil
}

func CheckDatabaseExists(db *gorm.DB, dbName string) (bool, error) {
	var count int64
	result := db.Raw("SELECT COUNT(datname) FROM pg_database WHERE datname = ?", dbName).Scan(&count)
	if result.Error != nil {
		return false, result.Error
	}
	return count > 0, nil
}

func CreateDatabase(db *gorm.DB, dbName string) error {
	database := fmt.Sprintf("CREATE DATABASE %s", dbName)
	result := db.Exec(database)
	return result.Error
}

func (p * PostSql) DeletePostgreSQLDatabase(databaseName string) error {
	db := p.DB
	result := db.Exec(fmt.Sprintf("DROP DATABASE IF EXISTS %s", databaseName))
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func ConnecttoMongoDB() (MongoDB) {
	// Connect to the database.
	dotenv_err := godotenv.Load()
	if dotenv_err != nil {
	  log.Fatal("Error loading .env file")
	}

	mongodb := os.Getenv("MONGODB_URI")
	client, error := mongo.NewClient(options.Client().ApplyURI(mongodb))
	
	if error != nil {
		print("Hello here 1")
		log.Fatal(error)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	err := client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		log.Fatal(err)
	}

	return 	MongoDB{	
		Client: client,
	}
}

func HashCalculator(block model.Block) string {
	//Hashing function
	record := strconv.Itoa(block.Num) + strconv.Itoa(block.Nounce) + block.Data.From + strconv.FormatFloat(block.Data.Amount, 'f', 10, 64) + block.Data.To + block.Prev
	h := sha256.New()
	h.Write([]byte(record))
	hashed := h.Sum(nil)
	return hex.EncodeToString(hashed)
}
