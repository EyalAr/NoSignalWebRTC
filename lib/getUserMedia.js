import 'webrtc-adapter-test'; // consistent webrtc api across browsers

const VID_WIDTH = 320;
const VID_HEIGHT = 240;

var gotCam = false,
    gotMic = false,
    media = null;

function getUserMedia(v, a){
    return new Promise((resolve, reject) => {
        if ((!v || gotCam) && (!a || gotMic)) return resolve(media);
        navigator.getUserMedia({
            audio: a,
            video: !v ? false : {
                width: VID_WIDTH,
                height: VID_HEIGHT
            }
        }, resolve, reject);
    }).then(res => {
        gotCam = gotCam || !!v;
        gotMic = gotMic || !!a;
        media = res;
        return res;
    });
}

export default getUserMedia;
