import { nanoid } from "nanoid/non-secure"
import { invoke } from "@tauri-apps/api/core";

export class Player {
    id: string
    video: HTMLVideoElement
    peerConnection: RTCPeerConnection;
    stream: MediaStream;

    constructor(public name: string, public src: string) {
        this.id = nanoid()
        this.video = document.createElement("video");
        this.stream = new MediaStream();
        this.peerConnection = new RTCPeerConnection();
        this.peerConnection.addEventListener("negotiationneeded", async () => {
            try {
                const offer = await this.peerConnection.createOffer();
                await this.peerConnection.setLocalDescription(offer);
                const local = await new Promise<RTCSessionDescription | null>((resolve) => {
                    /** Wait at most 1 second for ICE gathering. */
                    setTimeout(() => resolve(this.peerConnection.localDescription), 1000);
                    this.peerConnection.onicegatheringstatechange =
                        () => {
                            if (this.peerConnection.iceGatheringState === "complete")
                                resolve(this.peerConnection.localDescription);
                        }
                })
                if (!local) {
                    throw Error("failed to gather ICE candidates for offer");
                }
                while (this.peerConnection.connectionState !== "closed") {
                    const responce = await invoke<any>('post_sdpoffer', {
                        id: this.id,
                        url: this.src,
                        sdp: local.sdp
                    })
                    console.log(responce)
                    if (responce?.status == "ok") {
                        await this.peerConnection.setRemoteDescription(
                            new RTCSessionDescription({ type: "answer", sdp: responce?.answerSDP })
                        );
                        break
                    }
                    await new Promise((r) => setTimeout(r, 1000));
                }
            } catch (error) {
                console.error(error);
            }
        });
        this.peerConnection.addEventListener("connectionstatechange", () => {
            switch (this.peerConnection.connectionState) {
                case "new":
                case "connecting":
                case "disconnected":
                case "failed":
                case "closed":
                    this.video.srcObject = null;
                    break;
                case "connected":
                    this.video.srcObject = this.stream;
                    this.video.play();
                    break;
            }
        });
        this.peerConnection.addTransceiver("video", { direction: "recvonly" });
        this.peerConnection.addTransceiver("audio", { direction: "recvonly" });
        this.peerConnection.ontrack = (event) => {
            const track = event.track;
            switch (track.kind) {
                case "video":
                    if (!this.stream.getTracks().some(t => t.kind == 'video'))
                        this.stream.addTrack(track);
                    break;
                case "audio":
                    if (!this.stream.getTracks().some(t => t.kind == 'audio'))
                        this.stream.addTrack(track);
                    break;
            }
        };
    }
}