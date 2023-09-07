package main

import (
	"embed"
)

//go:embed dist/*
var content embed.FS

var ipcPort string = ":5172"
var fileServerPort string = ":5173"
