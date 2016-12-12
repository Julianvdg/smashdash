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
            return createLabels("Month", startMoment, endMoment);
        } else if ((endMoment.diff(startMoment, 'days')) > 0) {
            return createLabels("Day", startMoment, endMoment);
        } else if ((endMoment.diff(startMoment, 'hours')) > 0) {
            return createLabels("Hour", startMoment, endMoment);
        } else if ((endMoment.diff(startMoment, 'minutes')) > 0) {
            return createLabels("Minute", startMoment, endMoment);
        };
    }

    function createLabels(timeframe, startDate, endDate) {
      var startMoment = new moment(startDate);
      var endMoment = new moment(endDate);
      var allLabels = [];

      switch(timeframe) {
        case "Month":
            var startLabel = startMoment;
            var endLabel = endMoment;

            var currDate = startLabel.clone().subtract(1, 'months');
            var lastDate = endLabel.clone().endOf('month');

            while (currDate.add(1, 'months').diff(lastDate) < 0) {
                allLabels.push(currDate.clone().format('MM-YYYY'));
            }

            break;
      case "Day":
          var startLabel = startMoment.floor(24, 'hours');
          var endLabel = endMoment.floor(24, 'hours');

          // loop till startlabel = endlabel + push into allLables
          var currDate = startLabel.clone().subtract(1, 'days');
          var lastDate = endLabel.clone().endOf('day');

          while (currDate.add(1, 'days').diff(lastDate) < 0) {
              allLabels.push(currDate.clone().format('DD-MM-YYYY'));
          }

          break;
      case "Hour":
          var startLabel = startMoment.floor(1, 'hours');
          var endLabel = endMoment.floor(1, 'hours');

          // loop till startlabel = endlabel + push into allLables
          var currDate = startLabel.clone().subtract(1, 'hours');
          var lastDate = endLabel.clone().endOf('hour');


          while (currDate.add(1, 'hours').diff(lastDate) < 0) {
              allLabels.push(currDate.clone().format('H:mm'));
          }

          break;
      case "Minute":
          var startLabel = startMoment.floor(1, 'minutes');
          var endLabel = endMoment.floor(1, 'minutes');

          // loop till startlabel = endlabel + push into allLables
          var currDate = startLabel.clone().subtract(1, 'minutes');
          var lastDate = endLabel.clone().endOf('minute');


          while (currDate.add(1, 'minutes').diff(lastDate) < 0) {
              allLabels.push(currDate.clone().format('H:mm'));
          }

          break;

      }
      return allLabels;

    }




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




            console.log(getLabelInterval(startDateTime, endDateTime));
            var chartData = {
                labels: getLabelInterval(startDateTime, endDateTime),
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
