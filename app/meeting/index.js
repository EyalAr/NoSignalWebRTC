import EventEmitter from 'eventemitter2';
import $ from 'jquery';
import template from 'html!./index.html';
import '!style!css!less!./index.less';

class Meeting extends EventEmitter {
    constructor () {
        super();
        this._$root = $(template);
    }

    setLocalStream (s) {
        this._$root.find("video.local").show()[0].srcObject = s;
    }

    addRemoteStream (s) {
        var $vid = $("<video autoplay>").addClass("remote");
        $vid[0].srcObject = s;
        this._$root.append($vid);
    }

    render ($target) {
        return new Promise(resolve => {
            $target.append(this._$root);
            resolve();
        });
    }
}

export default Meeting;
