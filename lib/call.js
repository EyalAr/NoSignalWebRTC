import 'webrtc-adapter-test'; // consistent webrtc api across browsers
import EventEmitter from 'eventemitter2';
import getUserMedia from './getUserMedia';

class Call extends EventEmitter{
    constructor (video, audio) {
        super();
        var that = this;

        this._audio = !!audio;
        this._video = !!video;
        this._pc = new RTCPeerConnection();
        this._initiator = false;
        this._pUserMedia = undefined;
        this._iceCandidates = [];
        this._pIceCandidates = new Promise((resolve, reject) => {
            this._pc.onicecandidate = e => {
                if (e.candidate) that._iceCandidates.push(e.candidate);
                if (that._pc.iceGatheringState === "complete"){
                    that._pc.onicecandidate = undefined;
                    resolve(that._iceCandidates);
                }
            };
        });

        this._pc.onaddstream = data => {
            that.emit('stream.add.remote', data.stream);
        };
    }

    offer () {
        this._pUserMedia = this._pUserMedia || getUserMedia(this._video, this._audio);
        return this._pUserMedia.then(userMedia => {
            this._pc.addStream(userMedia);
            this.emit('stream.add.local', userMedia);
            return this._createOffer().then(offer => {
                return this._setLocalDescription(offer).then(() => {
                    return this._pIceCandidates.then(candidates => {
                        this._initiator = true;
                        return { offer: offer, candidates: candidates };
                    });
                });
            });
        });
    }

    acknowledge (offeranswer, remoteCandidates) {
        return this._setRemoteDescription(offeranswer).then(() => {
            return Promise.all(remoteCandidates.map(c => {
                return this._addRemoteIceCandidate(c);
            }));
        }).then(() => undefined);
    }

    answer (offer, remoteCandidates) {
        this._pUserMedia = this._pUserMedia || getUserMedia(this._video, this._audio);
        return this._pUserMedia.then(userMedia => {
            this._pc.addStream(userMedia);
            this.emit('stream.add.local', userMedia);
            return this.acknowledge(offer, remoteCandidates).then(() => {
                return this._createAnswer().then(answer => {
                    return this._setLocalDescription(answer).then(() => {
                        return this._pIceCandidates.then(candidates => {
                            return { answer: answer, candidates: candidates };
                        });
                    });
                });
            });
        });
    }

    _createOffer () {
        return this._pc.createOffer();
    }

    _createAnswer () {
        return this._pc.createAnswer();
    }

    _setLocalDescription (offeranswer) {
        return this._pc.setLocalDescription(new RTCSessionDescription(offeranswer));
    }

    _setRemoteDescription (offeranswer) {
        return this._pc.setRemoteDescription(new RTCSessionDescription(offeranswer));
    }

    _addRemoteIceCandidate (candidate) {
        return this._pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
}

export default Call;
