package graph

import (
	"context"
	"errors"
	"io"

	"github.com/99designs/gqlgen/graphql"
	"go.mongodb.org/mongo-driver/mongo"
	"gorm.io/gorm"
)

func MarshalDatabaseLink(link interface{}) graphql.Marshaler {
	switch link := link.(type) {
	case *gorm.DB:
		// Handle *gorm.DB type (PostgreSQL)
		return graphql.WriterFunc(func(w io.Writer) {
			io.WriteString(w, link.Dialector.Name())
		})
	case *mongo.Collection:
		// Handle *mongo.Collection type (MongoDB)
		return graphql.WriterFunc(func(w io.Writer) {
			io.WriteString(w, link.Name())
		})
	default:
		// Return an error if the link is not a supported type
		return graphql.WriterFunc(func(w io.Writer) {
			graphql.AddErrorf(context.Background(), "cannot marshal DatabaseLink")
		})
	}
}

func UnmarshalDatabaseLink(v interface{}) (interface{}, error) {
	switch v := v.(type) {
	case string:
		// Handle string type
		// Convert the string to the appropriate database link type based on your requirements
		// and return the converted value
		return v, nil
	case *gorm.DB:
		// Handle *gorm.DB type
		// Return the *gorm.DB value as is
		return v, nil
	case *mongo.Collection:
		// Handle *mongo.Collection type
		// Return the *mongo.Collection value as is
		return v, nil
	default:
		// Return an error if the value is not a supported type
		return nil, errors.New("cannot unmarshal DatabaseLink")
	}
}