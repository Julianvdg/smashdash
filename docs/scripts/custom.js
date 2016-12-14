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

    var eventProcessor = $('[data-select="event_processors"]').val(),
        startDateTime = $('#reportrange').data('daterangepicker').startDate,
        endDateTime = $('#reportrange').data('daterangepicker').endDate,
        chartType = $('input[name=chartTypeRadio]:checked').val(),
        formatUsedForLabels = '',
        labels = [];

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
        }
        ;
    }

    function createLabels(timeframe, startDate, endDate) {
        var startMoment = new moment(startDate);
        var endMoment = new moment(endDate);
        var allLabels = [];

        switch (timeframe) {
            case "Month":
                formatUsedForLabels = 'MM-YYYY';
                var startLabel = startMoment;
                var endLabel = endMoment;

                var currDate = startLabel.clone().subtract(1, 'months');
                var lastDate = endLabel.clone().endOf('month');

                while (currDate.add(1, 'months').diff(lastDate) < 0) {
                    allLabels.push(currDate.clone().format('MM-YYYY'));
                }

                break;
            case "Day":
                formatUsedForLabels = 'DD-MM-YYYY';
                var startLabel = startMoment.floor(24, 'hours');
                var endLabel = endMoment.floor(24, 'hours');

                var currDate = startLabel.clone().subtract(1, 'days');
                var lastDate = endLabel.clone().endOf('day');

                while (currDate.add(1, 'days').diff(lastDate) < 0) {
                    allLabels.push(currDate.clone().format('DD-MM-YYYY'));
                }

                break;
            case "Hour":
                formatUsedForLabels = 'H:mm';
                var startLabel = startMoment.floor(1, 'hours');
                var endLabel = endMoment.floor(1, 'hours');

                var currDate = startLabel.clone().subtract(1, 'hours');
                var lastDate = endLabel.clone().endOf('hour');

                while (currDate.add(1, 'hours').diff(lastDate) < 0) {
                    allLabels.push(currDate.clone().format('H:mm'));
                }

                break;
            case "Minute":
                formatUsedForLabels = 'H:mm';
                var startLabel = startMoment.floor(1, 'minutes');
                var endLabel = endMoment.floor(1, 'minutes');

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

            $("#chartTitle").html('<h2>' + eventProcessor + ' |<span> ' + moment(startDateTime).format('DD-MM-YYYY, H:mm') + ' / ' + moment(endDateTime).format('DD-MM-YYYY, H:mm') + '</span>' + '</h2>');

            var dataSets = [];

            var allLabels = getLabelInterval(startDateTime, endDateTime)

            // Get all platforms ids
            var platforms = _.map(response.data.data, function (platform) {
                return platform.data.platform_id;
            });

            // Only keep unique platform id's
            var uniquePlatforms = _.uniqBy(platforms, function (e) {
                return e;
            });

            for (var pi = 0; pi < uniquePlatforms.length; pi++) {
                var color = randomChartColor();
                var platformId = uniquePlatforms[pi];
                dataSets[pi] = {
                    label: "Platform " + platformId,
                    backgroundColor: color + ",0.5" + ")",
                    borderColor: color + ", 1" + ")",
                    pointBorderColor: color + ",0.7" + ")",
                    pointBackgroundColor: color + ", 0.7" + ")",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: "rgba(220,220,220,1)",
                    pointBorderWidth: 1,
                    data: [],
                };
                for (var li = 0; li < allLabels.length; li++) {
                    var currentLabel = allLabels[li],
                        foundValue   = false;
                    for (var i = 0; i < response.data.data.length; i++) {
                        var responseData = response.data.data[i],
                            createdMoment = new moment(responseData.created),
                            dateFormattedForLabel = createdMoment.format(formatUsedForLabels);
                        if (
                            responseData.data.platform_id === platformId &&
                            currentLabel === dateFormattedForLabel
                        ) {
                            dataSets[pi].data.push(responseData.total);
                            foundValue = true;
                            break;
                        }
                    }
                    if (false === foundValue) {
                        dataSets[pi].data.push(null);
                    }
                }
            }

            var chartData = {
                labels: getLabelInterval(startDateTime, endDateTime),
                datasets: dataSets,
            };

            drawGraph('chartCanvas', chartType, chartData);

        })
        .catch(function (error) {
            console.log(error);
        });
});

function randomChartColor() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgba(" + r + "," + g + "," + b ;
};


/**
 * Drawing a chart on the canvas based on the following params:
 * @param chartContextId
 * @param chartType
 * @param chartData
 */

var chart = null;

function drawGraph(chartContextId, chartType, chartData) {
    if(chart!=null){
        chart.destroy();
    }
    var ctx = document.getElementById(chartContextId);

    chart = new Chart(ctx, {
        type: chartType,
        data: chartData,
    });

}

/**
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var CURRENT_URL = window.location.href.split('#')[0].split('?')[0],
    $BODY = $('body'),
    $MENU_TOGGLE = $('#menu_toggle'),
    $SIDEBAR_MENU = $('#sidebar-menu'),
    $SIDEBAR_FOOTER = $('.sidebar-footer'),
    $LEFT_COL = $('.left_col'),
    $RIGHT_COL = $('.right_col'),
    $NAV_MENU = $('.nav_menu'),
    $FOOTER = $('footer');

// Sidebar
$(document).ready(function() {
    // TODO: This is some kind of easy fix, maybe we can improve this
    var setContentHeight = function () {
        // reset height
        $RIGHT_COL.css('min-height', $(window).height());

        var bodyHeight = $BODY.outerHeight(),
            footerHeight = $BODY.hasClass('footer_fixed') ? -10 : $FOOTER.height(),
            leftColHeight = $LEFT_COL.eq(1).height() + $SIDEBAR_FOOTER.height(),
            contentHeight = bodyHeight < leftColHeight ? leftColHeight : bodyHeight;

        // normalize content
        contentHeight -= $NAV_MENU.height() + footerHeight;

        $RIGHT_COL.css('min-height', contentHeight);
    };

    $SIDEBAR_MENU.find('a').on('click', function(ev) {
        var $li = $(this).parent();

        if ($li.is('.active')) {
            $li.removeClass('active active-sm');
            $('ul:first', $li).slideUp(function() {
                setContentHeight();
            });
        } else {
            // prevent closing menu if we are on child menu
            if (!$li.parent().is('.child_menu')) {
                $SIDEBAR_MENU.find('li').removeClass('active active-sm');
                $SIDEBAR_MENU.find('li ul').slideUp();
            }

            $li.addClass('active');

            $('ul:first', $li).slideDown(function() {
                setContentHeight();
            });
        }
    });

    // toggle small or large menu
    $MENU_TOGGLE.on('click', function() {
        if ($BODY.hasClass('nav-md')) {
            $SIDEBAR_MENU.find('li.active ul').hide();
            $SIDEBAR_MENU.find('li.active').addClass('active-sm').removeClass('active');
        } else {
            $SIDEBAR_MENU.find('li.active-sm ul').show();
            $SIDEBAR_MENU.find('li.active-sm').addClass('active').removeClass('active-sm');
        }

        $BODY.toggleClass('nav-md nav-sm');

        setContentHeight();

        // fixed sidebar
        if ($.fn.mCustomScrollbar) {
            $('.menu_fixed').mCustomScrollbar({
                autoHideScrollbar: true,
                theme: 'minimal',
                mouseWheel:{ preventDefault: true }
            });
        }
    });

    // check active menu
    $SIDEBAR_MENU.find('a[href="' + CURRENT_URL + '"]').parent('li').addClass('current-page');

    $SIDEBAR_MENU.find('a').filter(function () {
        return this.href == CURRENT_URL;
    }).parent('li').addClass('current-page').parents('ul').slideDown(function() {
        setContentHeight();
    }).parent().addClass('active');

    setContentHeight();

    // fixed sidebar
    if ($.fn.mCustomScrollbar) {
        $('.menu_fixed').mCustomScrollbar({
            autoHideScrollbar: true,
            theme: 'minimal',
            mouseWheel:{ preventDefault: true }
        });
    }
});
// /Sidebar

// NProgress
if (typeof NProgress != 'undefined') {
    $(document).ready(function () {
        NProgress.start();
    });

    $(window).load(function () {
        NProgress.done();
    });
}

