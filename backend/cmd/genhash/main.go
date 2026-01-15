package main

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	bytes, err := bcrypt.GenerateFromPassword([]byte("SuperAdmin@123"), bcrypt.DefaultCost)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(bytes))
}
