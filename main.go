package main

import (
	"github.com/promethiumjs/photon-lib-go/photon"
)

func main() {
	photon.Initialize(content, "dist", start, fileServerPort, ipcPort)
	go launchBrowserUI()
	photon.IPCInit(ipcPort)
}

func launchBrowserUI() {
	photon.ListenForConnection(fileServerPort)
	// photon.OpenInBrowser("http://localhost" + fileServerPort)
}
