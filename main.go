package main

import (
	"the-gatekeeper-org/the-gatekeeper/server"

	"github.com/promethiumjs/photon-lib-go/photon"
)

func main() {
	photon.Initialize(content, "dist", server.Start, fileServerPort, ipcPort)
	go launchBrowserUI()
	photon.IPCInit(ipcPort)
}

func launchBrowserUI() {
	photon.ListenForConnection(fileServerPort)
	// photon.OpenInBrowser("http://localhost" + fileServerPort)
}
