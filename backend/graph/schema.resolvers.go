package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.34

import (
	"context"
	"fmt"
	"log"
	"mat-back/database"
	"mat-back/graph/model"
	"sync"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// CreateUser is the resolver for the createUser field.
func (r *mutationResolver) CreateUser(ctx context.Context, matrixID string, username string, email string, password string) (*model.User, error) {
	model_user := model.User{
		ID:             uuid.New().String(),
		MatrixID:       matrixID,
		Email:          email,
		Password:       password,
		Username:       username,
		CurrentBalance: 0.0,
	}

	Post_Sql.DB.Create(&model_user)
	return &model_user, nil
}

// UpdateUser is the resolver for the updateUser field.
func (r *mutationResolver) UpdateUser(ctx context.Context, id string, matrixID string, username *string, email *string, password *string, currentBalance *float64) (*model.User, error) {
	var User model.User
	if err := Post_Sql.DB.First(&User, "id = ?", id).Error; err != nil {
		return nil, err
	}
	new_email := User.Email
	new_username := User.Username
	new_password := User.Password

	if email != nil {
		new_email = *email
	}
	if username != nil {
		new_username = *username
	}
	if password != nil {
		new_password = *password
	}

	model_user := model.User{
		ID:             id,
		MatrixID:       matrixID,
		Email:          new_email,
		Password:       new_password,
		Username:       new_username,
		CurrentBalance: User.CurrentBalance,
	}

	print("in the Update User function \n\n\n")

	Post_Sql.DB.Model(&User).Updates(&model_user)
	return &model_user, nil
}

// DeleteUser is the resolver for the deleteUser field.
func (r *mutationResolver) DeleteUser(ctx context.Context, id string, matrixID string) (*model.User, error) {
	var user model.User
	var matrix model.Matrix
	Post_Sql.DB.Where("id = ? AND matrix_id = ?", id, matrixID).First(&user)

	Post_Sql.DB.Where("id = ?", matrixID).Find(&matrix)

	log.Println(user.Username)
	log.Println(matrix.Name)

	client := Mongo_db.Client.Database(matrix.Name).Collection(user.Username)

	// Define the filter to select the documents to delete
	filter := bson.M{"userID": id} // Customize the filter based on your criteria

	// Delete the documents that match the filter
	result, err := client.DeleteMany(context.Background(), filter)
	if err != nil {
		log.Fatal(err)
	}

	// Print the number of deleted documents
	log.Printf("Deleted %d documents\n", result.DeletedCount)

	Post_Sql.DB.Where("id = ? AND matrix_id = ?", id, matrixID).Delete(&model.User{})

	return &user, nil
}

// CreateAdmin is the resolver for the createAdmin field.
func (r *mutationResolver) CreateAdmin(ctx context.Context, matrixID string, username string, email string, password string) (*model.Admin, error) {
	model_admin := model.Admin{
		ID:         uuid.New().String(),
		MatrixID:   matrixID,
		Email:      email,
		Password:   password,
		Username:   username,
		Privilidge: true,
	}

	Post_Sql.DB.Create(&model_admin)

	return &model_admin, nil
}

// UpdateAdmin is the resolver for the updateAdmin field.
func (r *mutationResolver) UpdateAdmin(ctx context.Context, id string, matrixID string, username *string, email *string, password *string) (*model.Admin, error) {
	var Admin model.Admin
	if err := Post_Sql.DB.First(&Admin, "id = ?", id).Error; err != nil {
		return nil, err
	}
	new_email := Admin.Email
	new_username := Admin.Username
	new_password := Admin.Password

	if email != nil {
		new_email = *email
	}
	if username != nil {
		new_username = *username
	}
	if password != nil {
		new_password = *password
	}

	model_admin := model.Admin{
		ID:         id,
		MatrixID:   matrixID,
		Email:      new_email,
		Password:   new_password,
		Username:   new_username,
		Privilidge: Admin.Privilidge,
	}

	print("in the Update User function \n\n\n")

	Post_Sql.DB.Model(&Admin).Updates(&model_admin)
	return &model_admin, nil
}

// UpdateRate is the resolver for the updateRate field.
func (r *mutationResolver) UpdateRate(ctx context.Context, id string, matrixID string) (*model.Admin, error) {
	panic(fmt.Errorf("not implemented: UpdateRate - updateRate"))
}

// CreateMatrix is the resolver for the createMatrix field.
func (r *mutationResolver) CreateMatrix(ctx context.Context, name string) (*model.Matrix, error) {
	matrix_model := model.Matrix{
		ID:   uuid.New().String(),
		Name: name,
	}
	print("in the create matrix function \n\n\n")
	Post_Sql.DB.Create(&matrix_model)
	//Add the Genesis block to the mongodb database
	client := Mongo_db.Client.Database(name).Collection("BlockChain")
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()
	gen_block := model.Block{
		Num:      0,
		Prev:     "",
		MatrixID: matrix_model.ID,
		Nounce:   0,
		Data: &model.Data{
			From:   "",
			To:     "",
			Amount: 0,
		},
		Verify: true,
	}

	gen_block.Current = database.HashCalculator(gen_block)
	fmt.Print("Genesis Block Current is: ", gen_block.Current)
	_, err := client.InsertOne(ctx, gen_block)

	if err != nil {
		log.Fatal(err)
	}

	return &matrix_model, nil
}

// UpdateMatrix is the resolver for the updateMatrix field.
func (r *mutationResolver) UpdateMatrix(ctx context.Context, id string, name *string) (*model.Matrix, error) {
	var Matrix model.Matrix
	if err := Post_Sql.DB.First(&Matrix, "id = ?", id).Error; err != nil {
		return nil, err
	}

	new_matrix := Matrix.Name
	if name != nil {
		new_matrix = *name
	}

	model_matrix := model.Matrix{
		ID:   id,
		Name: new_matrix,
	}

	print("in the Update User function \n\n\n")

	Post_Sql.DB.Model(&Matrix).Updates(&model_matrix)
	return &model_matrix, nil
}

// DeleteMatrix is the resolver for the deleteMatrix field.
func (r *mutationResolver) DeleteMatrix(ctx context.Context, id string) (*model.Matrix, error) {
	var Matrix model.Matrix

	Post_Sql.DB.Delete(&model.User{}, "matrix_id = ?", id)
	Post_Sql.DB.Delete(&model.Admin{}, "matrix_id = ?", id)
	Post_Sql.DB.Delete(&Matrix, "id = ?", id)

	err := Mongo_db.Client.Database(Matrix.Name).Drop(context.Background())
	if err != nil {
		log.Fatal(err)
	}

	return &Matrix, nil
}

// CreateBlock is the resolver for the createBlock field.
func (r *mutationResolver) CreateBlock(ctx context.Context, userID string, matrixID string, data model.DataType) (*model.Block, error) {
	var user model.User
	var matrix model.Matrix

	Post_Sql.DB.Where("id = ? AND matrix_id = ?", userID, matrixID).Find(&user)
	Post_Sql.DB.Where("id = ?", matrixID).Find(&matrix)

	client := Mongo_db.Client.Database(matrix.Name).Collection(user.Username)
	blockchain := Mongo_db.Client.Database(matrix.Name).Collection("BlockChain")
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)

	defer cancel()

	pipeline := mongo.Pipeline{
		{{Key: "$sort", Value: bson.D{{Key: "Num", Value: -1}}}},
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

	newNum := highestBlock.Num + 1
	/*
		Make a unique id for the object don't forget to add it there
		for it to use
	*/
	returnBlock := model.Block{
		Num:      newNum,
		UserID:   userID,
		MatrixID: matrixID,
		Data: &model.Data{
			From:   data.From,
			To:     data.To,
			Amount: data.Amount,
		},
		Prev: highestBlock.Current,
	}

	mutex.Lock()
	returnBlock.Current = database.HashCalculator(returnBlock)
	mutex.Unlock()

	log.Print("The return Block current value is", returnBlock.Current)

	_, err := client.InsertOne(ctx, returnBlock)

	if err != nil {
		log.Fatal(err)
	}
	/*
		Insert it into all the current transactions waiting to be mined by peers and hence being verified
	*/
	currentblock := Mongo_db.Client.Database(matrix.Name).Collection("CurrentBlock")
	currentTransaction := model.CurrentTransaction{
		Block:   &returnBlock,
		Percent: 0.0,
		Status:  false,
	}
	_, err = currentblock.InsertOne(ctx, currentTransaction)

	if err != nil {
		log.Fatal(err)
	}

	/*
		All the transactions that needs to be updated on blocks left to mine by the peers
		Need to complete the how of mining the block maybe will need to form a new
		type that allows for mining and then the value is compared
		when more than 50% is reached then the mining is done and the block is added to the blockchain
	*/
	new_collection := user.Username + "MineBlocks"
	log.Print(new_collection)

	userTransaction := Mongo_db.Client.Database(matrix.Name).Collection(new_collection)
	_, err = userTransaction.InsertOne(ctx, returnBlock)
	if err != nil {
		log.Fatal(err)
	}

	return &returnBlock, nil
}

// UpdateBlock is the resolver for the updateBlock field.
func (r *mutationResolver) UpdateBlock(ctx context.Context, userID string, matrixID string, num *int, nounce *int, data *model.DataType, prev *string, current *string) (*model.Block, error) {
	var user model.User
	var matrix model.Matrix
	Post_Sql.DB.Where("id = ? AND matrix_id = ?", userID, matrixID).Find(&user)
	Post_Sql.DB.Where("id = ?", matrixID).Find(&matrix)

	client := Mongo_db.Client.Database(matrix.Name).Collection(user.Username)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	filter := bson.M{"_num": num}
	update := bson.M{"$set": bson.M{"data": data}}

	result, error_up := client.UpdateOne(ctx, filter, update)

	if error_up != nil {
		log.Fatal(error_up)
	}

	if result.ModifiedCount == 0 {
		return nil, fmt.Errorf("no matching block found for update")
	}

	var block model.Block
	if err := client.FindOne(ctx, filter).Decode(&block); err != nil {
		return nil, err
	}

	return &block, nil
}

// DeleteBlock is the resolver for the deleteBlock field.
func (r *mutationResolver) DeleteBlock(ctx context.Context, userID string, matrixID string, num int) (*model.Block, error) {
	var user model.User
	var matrix model.Matrix

	Post_Sql.DB.Where("id = ? AND matrix_id = ?", userID, matrixID).Find(&user)
	Post_Sql.DB.Where("id = ?", matrixID).Find(&matrix)

	client := Mongo_db.Client.Database(matrix.Name).Collection(user.Username)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)

	defer cancel()

	filter := bson.M{"_num": num}
	_, err := client.DeleteOne(ctx, filter)
	if err != nil {
		log.Fatal(err)
	}
	return &model.Block{}, nil
}

// MineBlock is the resolver for the mineBlock field.
func (r *mutationResolver) MineBlock(ctx context.Context, userID string, matrixID string, block model.BlockType) (bool, error) {
	var user model.User
	var matrix model.Matrix
	var count int64

	Post_Sql.DB.Where("matrix_id = ?", matrixID).Count(&count)
	Post_Sql.DB.Where("id = ? AND matrix_id = ?", userID, matrixID).Find(&user)
	Post_Sql.DB.Where("id = ?", matrixID).Find(&matrix)

	blockchain := Mongo_db.Client.Database(matrix.Name).Collection("BlockChain")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{Key: "$sort", Value: bson.D{{Key: "Num", Value: -1}}}},
		{{Key: "$limit", Value: 1}},
	}

	cur, error_ := blockchain.Aggregate(context.Background(), pipeline)

	if error_ != nil {
		log.Fatal(error_)
	}

	defer cur.Close(context.Background())

	var oldBlock model.Block
	for cur.Next(context.Background()) {
		err := cur.Decode(&oldBlock)
		if err != nil {
			log.Fatal(err)
		}
	}

	newBlock := model.Block{
		UserID:   userID,
		MatrixID: matrixID,
		Data: &model.Data{
			From:   block.Data.From,
			To:     block.Data.To,
			Amount: block.Data.Amount,
		},
		Prev:    block.Prev,
		Current: block.Current,
	}

	store := database.IsBlockValid(oldBlock, newBlock)
	var new_user model.User
	Post_Sql.DB.Where("username = ? AND matrix_id = ?", block.Data.To, matrixID).Find(&new_user)
	amount := user.CurrentBalance - block.Data.Amount

	if store && amount >= 0 {
		Mongo_db.UpdateBlock(matrix.Name, "CurrentBlock", count, block.Num)
		user.CurrentBalance = amount
		new_user.CurrentBalance += block.Data.Amount
		Post_Sql.DB.Save(&user)
		Post_Sql.DB.Save(&new_user)
		return true, nil
	} else {
		return false, nil
	}
}

// Users is the resolver for the users field.
func (r *queryResolver) Users(ctx context.Context, matrixID string) ([]*model.User, error) {
	var users []*model.User
	Post_Sql.DB.Where("matrix_id = ?", matrixID).Find(&users)
	return users, nil
}

// User is the resolver for the user field.
func (r *queryResolver) User(ctx context.Context, id string, matrixID string) (*model.User, error) {
	var user model.User
	Post_Sql.DB.Where("id = ? AND matrix_id = ?", id, matrixID).Find(&user)
	return &user, nil
}

// Admin is the resolver for the admin field.
func (r *queryResolver) Admin(ctx context.Context, id string, matrixID string) (*model.Admin, error) {
	var admin model.Admin
	Post_Sql.DB.Where("id = ? AND matrix_id = ?", id, matrixID).Find(&admin)
	return &admin, nil
}

// Matrix is the resolver for the Matrix field.
func (r *queryResolver) Matrix(ctx context.Context, id string) (*model.Matrix, error) {
	var matrix model.Matrix
	Post_Sql.DB.Where("id = ?", id).Find(&matrix)
	return &matrix, nil
}

// Matrices is the resolver for the Matrices field.
func (r *queryResolver) Matrices(ctx context.Context) ([]*model.Matrix, error) {
	var matrices []*model.Matrix
	Post_Sql.DB.Find(&matrices)
	return matrices, nil
}

// Blocks is the resolver for the Blocks field.
func (r *queryResolver) Blocks(ctx context.Context, matrixID string, userID string) ([]*model.Block, error) {
	var user model.User
	var matrix model.Matrix

	Post_Sql.DB.Where("id = ? AND matrix_id = ?", userID, matrixID).Find(&user)
	Post_Sql.DB.Where("id = ?", matrixID).Find(&matrix)

	client := Mongo_db.Client.Database(matrix.Name).Collection(user.Username)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var blocks []*model.Block

	cursor, err := client.Find(ctx, bson.M{})
	if err != nil {
		log.Fatal(err)
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var block model.Block
		if err = cursor.Decode(&block); err != nil {
			log.Fatal(err)
		}
		blocks = append(blocks, &block)
	}

	return blocks, nil
}

// Block is the resolver for the Block field.
func (r *queryResolver) Block(ctx context.Context, num int, matrixID string, userID string) (*model.Block, error) {
	var user model.User
	var matrix model.Matrix

	Post_Sql.DB.Where("id = ? AND matrix_id = ?", userID, matrixID).Find(&user)
	Post_Sql.DB.Where("id = ?", matrixID).Find(&matrix)

	client := Mongo_db.Client.Database(matrix.Name).Collection(user.Username)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	filter := bson.M{"_num": num}
	var block model.Block

	results := client.FindOne(ctx, filter)
	if err := results.Decode(&block); err != nil {
		log.Fatal(err)
	}

	return &block, nil
}

// BlocksToPrint is the resolver for the BlocksToPrint field.
func (r *queryResolver) BlocksToPrint(ctx context.Context, matrixID string, userID string, collection string) ([]*model.CurrentTransaction, error) {
	var matrix model.Matrix
	var user model.User

	Post_Sql.DB.Where("id = ? AND matrix_id = ?", userID, matrixID).Find(&user)
	Post_Sql.DB.Where("id = ?", matrixID).Find(&matrix)

	new_collection := user.Username + collection
	client := Mongo_db.Client.Database(matrix.Name).Collection(new_collection)
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var blocks []*model.CurrentTransaction

	cursor, err := client.Find(ctx, bson.M{})
	if err != nil {
		log.Fatal(err)
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var block model.CurrentTransaction
		if err = cursor.Decode(&block); err != nil {
			log.Fatal(err)
		}
		blocks = append(blocks, &block)
	}

	return blocks, nil
}

// BlockChain is the resolver for the BlockChain field.
func (r *queryResolver) BlockChain(ctx context.Context, matrixID string) ([]*model.Block, error) {
	var matrix model.Matrix
	Post_Sql.DB.Where("id = ?", matrixID).Find(&matrix)

	client := Mongo_db.Client.Database(matrix.Name).Collection("BlockChain")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var blocks []*model.Block

	cursor, err := client.Find(ctx, bson.M{})
	if err != nil {
		log.Fatal(err)
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var block model.Block
		if err = cursor.Decode(&block); err != nil {
			log.Fatal(err)
		}
		blocks = append(blocks, &block)
	}

	return blocks, nil
}

// VerifyAdmin is the resolver for the verifyAdmin field.
func (r *queryResolver) VerifyAdmin(ctx context.Context, id string, matrixID string, username string, password string) (bool, error) {
	var admin model.Admin
	Post_Sql.DB.Where("id = ? AND matrix_id = ?", id, matrixID).Find(&admin)

	if admin.Username == username && admin.Password == password && admin.Privilidge {
		return true, nil
	}
	return false, nil
}

// VerifyUser is the resolver for the verifyUser field.
func (r *queryResolver) VerifyUser(ctx context.Context, id string, matrixID string, username string, password string) (bool, error) {
	var user model.User
	Post_Sql.DB.Where("id = ? AND matrix_id = ?", id, matrixID).Find(&user)

	if user.Username == username && user.Password == password {
		return true, nil
	}
	return false, nil
}

// Mutation returns MutationResolver implementation.
func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }

// !!! WARNING !!!
// The code below was going to be deleted when updating resolvers. It has been copied here so you have
// one last chance to move it out of harms way if you want. There are two reasons this happens:
//   - When renaming or deleting a resolver the old code will be put in here. You can safely delete
//     it when you're done.
//   - You have helper methods in this file. Move them out to keep these resolver files clean.
var mutex = &sync.Mutex{}
var Mongo_db = database.ConnecttoMongoDB()
var Post_Sql = database.ConnecttoPostSql("Simulation", &model.Matrix{}, &model.Admin{}, &model.User{})
