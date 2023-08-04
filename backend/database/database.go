package database

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"mat-back/graph/model"
	"math/rand"
	"os"
	"strconv"
	"time"
	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
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
	log.Print("Exists Value: \n", exists)

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
	log.Print(result)
	log.Print(count)
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

func IsBlockValid(oldBlock, newBlock model.Block) bool {
	if (oldBlock.Num + 1) != newBlock.Num {
		log.Print("Block Number is not valid 1")
		return false
	}

	if oldBlock.Current != newBlock.Prev {
		log.Print("Block Number is not valid 2")
		return false
	}

	if HashCalculator(newBlock) != newBlock.Current {
		log.Print("New Block Current: ", newBlock.Current)
		log.Print("Block Number is not valid 3")
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
	log.Print("Hashed Value from new_block: ", hex.EncodeToString(hashed))
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

func (M * MongoDB) UpdateBlock(matrixName string, collection string, count int64, userID string, matrixID string, Current string) (bool){
	/*
		Open the CurrentBlock Collection and find the block we recieved from the user.
	*/
	client := M.Client.Database(matrixName).Collection(collection)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	
	filter := bson.D{{Key: "block.current", Value: Current},
		{Key: "block.matrixID", Value: matrixID},
		{Key: "block.userID", Value: userID}}
	
	var dataBlock model.CurrentTransaction
	err := client.FindOne(ctx, filter).Decode(&dataBlock)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			fmt.Println("Document not found")
		} else {
			log.Fatal(err)
		}
	}

	/*
		Update the count of people mining this block in the CurrentBlock Collection
	*/

	change := (dataBlock.Percent * float64(count) + 1)/float64(count)
	dataBlock.Percent = change
	/*
		This part basically checks if the Current Block collection has reached 50% of the total mine.
		If yes then it removes the block from the Current Block collection and adds it to the Blockchain collection.
		or else it just updates the current block collection with the new percent value.
	*/
	if dataBlock.Percent > 0.5{
		var insertBlock model.Block = *dataBlock.Block
		insertBlock.Verify = true
		blockchain := M.Client.Database(matrixName).Collection("Blockchain")
		_, err := blockchain.InsertOne(ctx, insertBlock)
		if err != nil {
			log.Fatal(err)
		}
		client.DeleteOne(ctx, filter)
		return true
	}else{
		update := bson.D{{Key: "$set", Value: bson.D{{Key: "percent", Value: dataBlock.Percent}}}}
		_, err := client.UpdateOne(ctx, filter, update)
		if err != nil {
			log.Fatal(err)
		}
		return false
	}
}

func (M * MongoDB) GetHighestFromBlockChain(matrixName string, collection string) (model.Block){
	blockchain := M.Client.Database(matrixName).Collection(collection)
	_, cancel := context.WithTimeout(context.Background(), 60*time.Second)

	defer cancel()

	pipeline := mongo.Pipeline{
		{{Key: "$sort", Value: bson.D{{Key: "_num", Value: -1}}}},
		{{Key: "$limit", Value: 1}},
	}

	cur, error_ := blockchain.Aggregate(context.Background(), pipeline)
	if error_ != nil {
		log.Fatal(error_)
	}
	defer cur.Close(context.Background())

	var highestBlock model.Block
	for cur.Next(context.Background()) {
		err := cur.Decode(&highestBlock)
		if err != nil {
			log.Fatal(err)
		}
	}

	return highestBlock
}

func (M * MongoDB) DeleteBlockFromMineBlock(matrixName string, collection string, id string){
	_id, _ := primitive.ObjectIDFromHex(id)
	_, err := M.Client.Database(matrixName).Collection(collection).DeleteOne(context.Background(), bson.D{{Key: "_id", Value: _id}})
	if err != nil {
		log.Fatal(err)
	}
}

func (M * MongoDB) UpdateMineBlock(matrixName string, collection string, num int, prev string){
	coll := M.Client.Database(matrixName).Collection(collection)
	cursor, err := coll.Find(context.TODO(), bson.D{})

	if err != nil {
		log.Fatal(err)
	}
	var block model.Block
	for cursor.Next(context.TODO()) {	
		var result bson.M	
		if err := cursor.Decode(&block); err != nil {
			log.Fatal(err)
		}
		if err = cursor.Decode(&result); err != nil {
			log.Fatal(err)
		}
		fmt.Println(block)
		id := result["_id"].(primitive.ObjectID)
		block.Num = num
		block.Prev = prev
		update := bson.M{
			"$set": bson.M{
				"prev":    prev,
				"_num":    num,
				"current": HashCalculator(block),
			},
		}
		_, err := coll.UpdateOne(context.Background(), bson.M{"_id": id}, update)
		if err != nil {
			log.Fatal(err)
		}
	}
}

func (M * MongoDB) UpdateCurrentBlock(matrixName string, collection string, num int, prev string){
	coll := M.Client.Database(matrixName).Collection(collection)
	cursor, err := coll.Find(context.TODO(), bson.D{})

	if err != nil {
		log.Fatal(err)
	}
	var block model.CurrentTransaction
	for cursor.Next(context.TODO()) {	
		var result bson.M	
		if err := cursor.Decode(&block); err != nil {
			log.Fatal(err)
		}
		if err = cursor.Decode(&result); err != nil {
			log.Fatal(err)
		}
		fmt.Println(block)
		id := result["_id"].(primitive.ObjectID)
		block.Block.Num = num
		block.Block.Prev = prev
		update := bson.M{
			"$set": bson.M{
				"block.prev":    prev,
				"block._num":    num,
				"block.current": HashCalculator(*block.Block),
			},
		}
		_, err := coll.UpdateOne(context.Background(), bson.M{"_id": id}, update)
		if err != nil {
			log.Fatal(err)
		}
	}
}

func (M * MongoDB) AddToPreviosTransactions(matrixName string, username string , block model.Block){
	_, err := M.Client.Database(matrixName).Collection(username).InsertOne(context.Background(), block)
	if err != nil {
		log.Fatal(err)
	}
}

func RandomVariableCreator() int{
	min := 1
	max := 1000000000
	return rand.Intn(max-min+1) + min
}