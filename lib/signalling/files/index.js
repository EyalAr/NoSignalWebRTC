import EventEmitter from 'eventemitter2';
import $ from 'jquery';
import Ractive from 'ractive';
import template from 'ractive!./index.html';
import '!style!css!less!./index.less';

class ManualSignalling extends EventEmitter {
    constructor () {
        super();
        var model = this._model = {
            fileList: []
        };
        this._comp = new Ractive({
            template: template,
            data: this._model,
            makeOffer: () => this.emit('make-offer'),
            gotAnswer: () => {
                getFileContents(model.fileList[0]).then(contents => {
                    this.emit('got-answer', JSON.parse(contents));
                });
            },
            gotOffer: () => {
                getFileContents(model.fileList[0]).then(contents => {
                    this.emit('got-offer', JSON.parse(contents));
                });
            }
        });
    }

    getName () {
        return "Files";
    }

    sendOffer (data) {
        data = JSON.stringify(data, null, 2);
        downloadFile(data, 'offer.txt');
    }

    sendAnswer (data) {
        data = JSON.stringify(data, null, 2);
        downloadFile(data, 'answer.txt');
    }

    render ($target) {
        return new Promise(resolve => {
            this._comp.render($target);
            resolve();
        });
    }
}

function getFileContents(file){
    var reader = new FileReader();
    return new Promise((resolve, reject) => {
        if (!file) throw Error();
        reader.readAsText(file);
        reader.onload = resolve;
        reader.onerror = reject;
    }).then(() => reader.result, () => "");
}

function downloadFile(contents, filename){
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(contents));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
}

export default ManualSignalling;
