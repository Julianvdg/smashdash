// API Calls

// Get all event processors and populate select event dropdown $('[data-select="event_processors"]')
axios.get('http://api.smashmail.nl/event/V1/getAllEventProcessors')
    .then(function (response) {
        response.data.data.forEach(function (eventProcessor) {
            $('[data-select="event_processors"]').append('<option value="' + eventProcessor.aggregationName + '">' + eventProcessor.aggregationName + '</option>');
        });
    })
    .catch(function (error) {
        console.log(error);
    });

// Create chart based on filled in params(startDate, endDate, eventProcessor) | request made to http://api.smashmail.nl/event/V1/getEventStatisticByEventProcessor
$('[data-button="generate_graph"]').click(function () {

    var eventProcessor = $('[data-select="event_processors"]').val();
    var startDateTime = $('#reportrange').data('daterangepicker').startDate._d;
    var endDateTime = $('#reportrange').data('daterangepicker').endDate._d;

    axios.get('http://api.smashmail.nl/event/V1/getEventStatisticByEventProcessor?startDate='+ startDateTime.toISOString() +'&endDate='+ endDateTime.toISOString() +'&eventProcessor=' + eventProcessor + '')
        .then(function (response) {
            console.log(response.data.data);

            // console.log(_.filter(response.data.data, {
            //   data: {
            //     platform_id: 5,
            //     action: "email_sent"
            //   }
            // }));


            var summary = {
              "data": [{
                "created": "2016-12-05 00:00:00",
                "data": {
                  "action": "email_sent",
                  "platform_id": 3
                },
                "total": "120889"
              },]
            }

            console.log(_.filter(summary.data, {
              data: {
                platform_id: 3,
                action: "email_sent"
              }
            }));



        })
        .catch(function (error) {
            console.log(error);
        });
});
