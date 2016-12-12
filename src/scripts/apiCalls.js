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
    var startDateTime = $('#reportrange').data('daterangepicker').startDate;
    var endDateTime = $('#reportrange').data('daterangepicker').endDate;

    var labels = [];

    getLabelInterval(startDateTime, endDateTime);

    function getLabelInterval(startTimestamp, endTimestamp) {
        var startMoment = moment(startTimestamp);
        var endMoment = moment(endTimestamp);

        if ((endMoment.diff(startMoment, 'months')) > 0) {

        } else if ((endMoment.diff(startMoment, 'days')) > 0) {
            createDayLabels(startMoment, endMoment);
        } else if ((endMoment.diff(startMoment, 'hours')) > 0) {
            createHourLabels(startMoment, endMoment);
        } else if ((endMoment.diff(startMoment, 'minutes')) > 0) {

        }
        ;
    }

    function createDayLabels(startDate, endDate) {
        var startMoment = new moment(startDate);
        var endMoment = new moment(endDate);
        var allLabels = [];
        var startLabel = startMoment.floor(24, 'hours');
        var endLabel = endMoment.floor(24, 'hours');

        // loop till startlabel = endlabel + push into allLables
        var currDate = startLabel.clone().subtract(1, 'days');
        var lastDate = endLabel.clone().endOf('day');

        while (currDate.add(1, 'days').diff(lastDate) < 0) {
            allLabels.push(currDate.clone().format('DD-MM-YYYY'));
        }
        console.log(allLabels);
    }

    function createHourLabels(startDate, endDate) {
        var startMoment = new moment(startDate);
        var endMoment = new moment(endDate);
        var allLabels = [];
        var startLabel = startMoment.floor(1, 'hours');
        var endLabel = endMoment.floor(1, 'hours');

        console.log(startLabel);
        console.log(endLabel);

        // loop till startlabel = endlabel + push into allLables
        var currDate = startLabel.clone().subtract(1, 'hours');
        var lastDate = endLabel.clone().endOf('hour');

        console.log( currDate.add(1, 'hours'));

        while (currDate.add(1, 'hours').diff(lastDate) < 0) {
            console.log(currDate.clone().format('H:mm'));
            allLabels.push(currDate.clone().format('H:00'));
        }
        console.log(allLabels);
    }


    // createDayLabels(startDateTime, endDateTime);
    //
    // if ((moment(endDateTime).diff(moment(startDateTime), 'months')) > 0) {
    //     console.log("Months");
    // } else if ((moment(endDateTime).diff(moment(startDateTime), 'days')) > 0) {
    //     console.log("days");
    //
    //     var currDate = moment(startDateTime).clone().subtract(1, 'days');
    //     var lastDate = moment(endDateTime).clone().endOf('day');
    //
    //     while (currDate.add(1, 'days').diff(lastDate) < 0) {
    //         labels.push(currDate.clone().format('DD-MM-YYYY'));
    //     }
    //     console.log(labels);
    // } else if ((moment(endDateTime).diff(moment(startDateTime), 'hours')) > 0) {
    //     console.log("hours");
    //
    //     var currDate = moment(startDateTime).clone().subtract(1, 'hours');
    //     var lastDate = moment(endDateTime).clone().endOf('hour');
    //
    //     while (currDate.add(1, 'hours').diff(lastDate) < 0) {
    //         labels.push(currDate.clone().format('H:HH'));
    //     }
    //     console.log(labels);
    //
    // } else if ((moment(endDateTime).diff(moment(startDateTime), 'minutes')) > 0) {
    //     console.log("minuten");
    // };


    axios.get('http://api.smashmail.nl/event/V1/getEventStatisticByEventProcessor?startDate=' + startDateTime.toISOString() + '&endDate=' + endDateTime.toISOString() + '&eventProcessor=' + eventProcessor + '')
        .then(function (response) {
            // convert string value to JS object
            response.data.data.forEach(function (data) {
                data.data = JSON.parse(data.data);
            });

            console.log(response.data.data);


            // Get all platforms ids
            var platforms = _.map(response.data.data, function (platform) {
                return platform.data.platform_id;
            });

            // Only keep unique platform id's
            var uniquePlatforms = _.uniqBy(platforms, function (e) {
                return e;
            });

            // Filter data per platform and create datasets

            _.forEach(uniquePlatforms, function (platformId) {
                var platformData = _.filter(response.data.data, {data: {platform_id: platformId}});
            });


            var chartData = {
                labels: labels,
                datasets: [{
                    label: "My First dataset",
                    backgroundColor: "rgba(38, 185, 154, 0.31)",
                    borderColor: "rgba(38, 185, 154, 0.7)",
                    pointBorderColor: "rgba(38, 185, 154, 0.7)",
                    pointBackgroundColor: "rgba(38, 185, 154, 0.7)",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: "rgba(220,220,220,1)",
                    pointBorderWidth: 1,
                    data: [null, 20, 30, 50],
                }, {
                    label: "My Second dataset",
                    backgroundColor: "rgba(38, 185, 154, 0.31)",
                    borderColor: "rgba(38, 185, 154, 0.7)",
                    pointBorderColor: "rgba(38, 185, 154, 0.7)",
                    pointBackgroundColor: "rgba(38, 185, 154, 0.7)",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: "rgba(220,220,220,1)",
                    pointBorderWidth: 1,
                    data: [30, 50, 30, 50],
                }]
            };

            drawGraph('chartCanvas', 'line', chartData);

        })
        .catch(function (error) {
            console.log(error);
        });
});


function getEventDatabyTimeframe(eventProcessor, startDate, endDate) {
    axios.get('http://api.smashmail.nl/event/V1/getEventStatisticByEventProcessor?startDate=' + startDate.toISOString() + '&endDate=' + endDate.toISOString() + '&eventProcessor=' + eventProcessor + '')
        .then(function (response) {

            response.data.data.forEach(function (data) {
                data.data = JSON.parse(data.data);
            });

            return response.data.data;
        })
        .catch(function (error) {
            console.log(error);
        });
}

function filterEventData(eventData, filters) {

}

/**
 * Drawing a chart on the canvas based on the following params:
 * @param chartContextId
 * @param chartType
 * @param chartData
 */

function drawGraph(chartContextId, chartType, chartData) {

    var ctx = document.getElementById(chartContextId);

    var chart = new Chart(ctx, {
        type: chartType,
        data: chartData,
    });

}
