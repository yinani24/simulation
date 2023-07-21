package database

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	// "crypto/ecdsa"
	// "crypto/elliptic"
	// "crypto/rand"
	"fmt"
	"log"
	"mat-back/graph/model"
	"os"
	"strconv"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
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
func ConnecttoPostSql(M string, models ... interface{}) (PostSql) {
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

	Post := PostSql{
		DB: db,
	}

	exists, error1 := Post.CheckDatabaseExists(M)
	if error1 != nil {
		log.Fatal(error1)
	}
	if !exists {
		Post.CreateDatabase(M)
		Post.MigratePostgreSQLSchema(models...)
	}

	return PostSql{
		DB: db,
	}
}

/*
	Used to Migrate the schema of the models to the Postgres Database i.e Matrix, User and Admin
*/
func (p * PostSql) MigratePostgreSQLSchema(models ...interface{}) error {
	err := p.DB.AutoMigrate(models...)
	if err != nil {
		return err
	}
	return nil
}

/*
	To check if the database exists or not
*/
func (p * PostSql) CheckDatabaseExists(dbName string) (bool, error) {
	var count int64
	result := p.DB.Raw("SELECT COUNT(datname) FROM pg_database WHERE datname = ?", dbName).Scan(&count)
	if result.Error != nil {
		return false, result.Error
	}
	return count > 0, nil
}

/*
	To create the database for the first time
*/
func (p * PostSql) CreateDatabase(dbName string) error {
	database := fmt.Sprintf("CREATE DATABASE %s", dbName)
	result := p.DB.Exec(database)
	return result.Error
}

/*
	To delete the database
*/

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

func IsBlockValid(newBlock, oldBlock model.Block) bool {
	if oldBlock.Num+1 != newBlock.Num {
		return false
	}

	if oldBlock.Current != newBlock.Prev {
		return false
	}

	if HashCalculator(newBlock) != newBlock.Current {
		return false
	}

	return true
}

func HashCalculator(block model.Block) string {
	//Hashing function
	record := strconv.Itoa(block.Nounce) + block.Data.From + strconv.FormatFloat(block.Data.Amount, 'f', 10, 64) + block.Data.To + block.Prev
	h := sha256.New()
	h.Write([]byte(record))
	hashed := h.Sum(nil)
	return hex.EncodeToString(hashed)
}

// func generateKeyPair() (*ecdsa.PrivateKey, *ecdsa.PublicKey, error) {
// 	// Generate a random private key
// 	privateKey, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
// 	if err != nil {
// 		return nil, nil, err
// 	}

// 	// Derive the public key from the private key
// 	publicKey := &privateKey.PublicKey

// 	return privateKey, publicKey, nil
// }

// func PrivatePublicKey() {
// 	privateKey, publicKey, err := generateKeyPair()
// 	if err != nil {
// 		log.Fatal(err)
// 	}

// 	// Serialize the public key to hex
// 	publicKeyBytes := elliptic.Marshal(publicKey.Curve, publicKey.X, publicKey.Y)
// 	publicKeyHex := hex.EncodeToString(publicKeyBytes)

// 	fmt.Println("Private Key:", privateKey)
// 	fmt.Println("Public Key:", publicKeyHex)
// }

func (M * MongoDB) UpdateBlock(matrixName string, collection string, count int64, num int) (bool){
	client := M.Client.Database(matrixName).Collection(collection)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	
	filter := bson.D{{Key: "num", Value: num}}
	var dataBlock model.CurrentTransaction
	err := client.FindOne(ctx, filter).Decode(&dataBlock)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			fmt.Println("Document not found")
		} else {
			log.Fatal(err)
		}
	}

	change := (dataBlock.Percent * float64(count) + 1)/50
	dataBlock.Percent = change
	/*
		This part basically checks if the Current Block collection has reached 50% of the total mine.
		If yes then it removes the block from the Current Block collection and adds it to the Blockchain collection.
		or else it just updates the current block collection with the new percent value.
	*/
	if dataBlock.Percent > 0.5{
		var insertBlock model.Block = *dataBlock.Block
		blockchain := M.Client.Database(matrixName).Collection("Blockchain")
		_, err := blockchain.InsertOne(ctx, insertBlock)
		if err != nil {
			log.Fatal(err)
		}
		client.DeleteOne(ctx, filter)
		return true
	}else{
		update := bson.D{{Key: "$set", Value: bson.D{{Key: "current", Value: dataBlock.Block.Current}}}}
		_, err := client.UpdateOne(ctx, filter, update)
		if err != nil {
			log.Fatal(err)
		}
		return false
	}
}