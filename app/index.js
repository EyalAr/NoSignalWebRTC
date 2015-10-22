import $ from 'jquery';
import Call from '../lib/call';
import ManualSignalling from '../lib/signalling/manual';
import FileSignalling from '../lib/signalling/files';
import Meeting from './meeting';
import template from 'html!./index.html';
import '!style!css!less!./index.less';

var $body = $('body').append($(template)),
    $error = $body.find('#error'),
    $serviceList = $body.find('#signalling-services'),
    $servicePrompt = $body.find('#signalling-services-prompt'),
    $serviceContainer = $body.find('#service-container'),
    $meetingContainer = $body.find('#meeting-container');

var meeting = new Meeting();
meeting.render($meetingContainer);

registerSignallingService(new ManualSignalling());
registerSignallingService(new FileSignalling());

$serviceList.change(() => {
    var $option = $serviceList.find("option:selected");
    activateService($option.data('service'));
});

function registerSignallingService(service){
    $('<option>')
        .text(service.getName())
        .data('service', service)
        .appendTo($serviceList);

    service.on('make-offer', () => {
        var call = new Call(true, true);
        $error.hide();
        call.on('stream.add.local', meeting.setLocalStream.bind(meeting));
        call.on('stream.add.remote', meeting.addRemoteStream.bind(meeting));
        call.offer().then(data => {
            service.sendOffer({
                offer: data.offer.toJSON(),
                candidates: data.candidates.map(c => c.toJSON())
            });
            service.once('got-answer', data => {
                call.acknowledge(data.answer, data.candidates).catch(() => $error.show());
            });
        }).catch(() => $error.show());
    });

    service.on('got-offer', data => {
        var call = new Call(true, true);
        $error.hide();
        call.on('stream.add.local', meeting.setLocalStream.bind(meeting));
        call.on('stream.add.remote', meeting.addRemoteStream.bind(meeting));
        call.answer(data.offer, data.candidates).then(data => {
            service.sendAnswer({
                answer: data.answer.toJSON(),
                candidates: data.candidates.map(c => c.toJSON())
            });
        }).catch(() => $error.show());
    });
}

function activateService (service) {
    $serviceContainer.empty();
    if (service) service.render($serviceContainer);
}
