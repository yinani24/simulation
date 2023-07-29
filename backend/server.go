// package main

// import (
// 	"log"
// 	"mat-back/graph"
// 	"net/http"
// 	// "os"
// 	"github.com/99designs/gqlgen/graphql/handler"
// 	"github.com/99designs/gqlgen/graphql/playground"
// )

// const defaultPort = "8080"

// func main() {
// 	// port := os.Getenv("PORT")
// 	// if port == "" {
// 	// 	port = defaultPort
// 	// }

// 	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{}}))

// 	http.Handle("/", playground.Handler("GraphQL playground", "/query"))
// 	http.Handle("/query", srv)

// 	log.Printf("connect to http://localhost:%s/ for GraphQL playground", defaultPort)
// 	log.Fatal(http.ListenAndServe(":"+defaultPort, nil))
// }

package main

import (
	"log"
	"mat-back/graph"
	"net/http"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
)

const defaultPort = "8080"

func main() {
	srv := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{}}))

	// Create a new CORS handler middleware
	corsHandler := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Set CORS headers
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization")

			// Handle preflight requests
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	}

	// Wrap the playground and GraphQL handler with the CORS middleware
	http.Handle("/", corsHandler(playground.Handler("GraphQL playground", "/query")))
	http.Handle("/query", corsHandler(srv))

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", defaultPort)
	log.Fatal(http.ListenAndServe(":"+defaultPort, nil))
}
