package server

import (
	"fmt"

	"github.com/promethiumjs/photon-lib-go/photon"
)

func Start() {
	photon.IPCHub.On("add", func(ipcID string) {
		ipc := photon.IPCHub.GetIPC(ipcID)
		fmt.Println("new instance added!")
		ipc.On("action", emitAction)
	})

	photon.IPCHub.On("remove", func(_ string) {
		fmt.Println("old instance removed!")
	})
}

type MessageInfo struct {
	Message string `json:"message"`
}

func emitAction(p photon.Payload, _ string, ipc *photon.IPC) {
	for _, otheripc := range photon.IPCHub.IPCS {
		if otheripc.ID != ipc.ID {
			otheripc.Emit("action", p)
		}
	}
}
