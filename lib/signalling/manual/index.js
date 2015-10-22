import EventEmitter from 'eventemitter2';
import $ from 'jquery';
import Ractive from 'ractive';
import template from 'ractive!./index.html';
import '!style!css!less!./index.less';

class ManualSignalling extends EventEmitter {
    constructor () {
        super();
        this._model = {
            data: ''
        };
        this._comp = new Ractive({
            template: template,
            data: this._model,
            makeOffer: () => this.emit('make-offer'),
            gotAnswer: () => this.emit('got-answer', JSON.parse(this._model.data)),
            gotOffer: () => this.emit('got-offer', JSON.parse(this._model.data))
        });
    }

    getName () {
        return "Manual";
    }

    sendOffer (data) {
        this._comp.set('data', JSON.stringify(data, null, 2));
    }

    sendAnswer (data) {
        this._comp.set('data', JSON.stringify(data, null, 2));
    }

    render ($target) {
        return new Promise(resolve => {
            this._comp.render($target);
            resolve();
        });
    }
}

export default ManualSignalling;
