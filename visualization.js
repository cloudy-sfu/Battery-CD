chart_1_option_temp = {
    title: {
        text: "",  // Battery index
    },
    tooltip: {
        trigger: "axis",
        axisPointer: {
            type: "cross",
        },
    },
    toolbox: {
        show: true,
        feature: {
            saveAsImage: { pixelRatio: 4 },
        },
    },
    xAxis: {
        type: "value",
        axisLabel: {
            formatter: "{value} h",
        },
        min: 0,
        max: null, // max hours
    },
    yAxis: {
        type: "value",
        axisLabel: {
            formatter: "{value} MWh",
        },
        axisPointer: {
            snap: true,
        },
        min: 0,
        max: null, // max capacity
    },
    visualMap: {
        show: false,
        dimension: 0,
        pieces: [], // curve color
        // example: {gt: 6, lte: 8, color: 'red'}
        // gt or lte is optional at the boundary
    },
    series: [
        {
            name: "Remained electricity",
            type: "line",
            smooth: true,
            symbol: "none",
            data: [], // 2D array
            markArea: {
                data: [], // background shadow color
                // example: [{xAxis: 7.5, itemStyle: {color: 'rgba(255, 175, 175, 0.4)'}}, {xAxis: 10}]
            },
        },
    ],
};
chart_2_option_temp = {
    tooltip: {
        trigger: "axis",
        axisPointer: {
            type: "cross",
        },
    },
    toolbox: {
        show: true,
        feature: {
            saveAsImage: { pixelRatio: 4 },
        },
    },
    legend: {
        data: []
    },
    xAxis: {
        type: "value",
        axisLabel: {
            formatter: "{value} h",
        },
        min: 1,
        max: null,
    },
    yAxis: {
        type: "value",
        axisLabel: {
            formatter: "{value} MW",
        },
        name: "Output power"
    },
    series: [],
};
chart_2_series_temp = {
    name: null,
    data: null,
    type: "line",
    smooth: true,
    symbol: "none",
};
chart_3_option_temp = {
    tooltip: {
        trigger: "axis",
        axisPointer: {
            type: "cross",
        },
    },
    toolbox: {
        show: true,
        feature: {
            saveAsImage: { pixelRatio: 4 },
        },
    },
    yAxis: [
        {
            type: "value",
            axisLabel: {
                formatter: "{value} MWh",
            },
        },
    ],
    xAxis: [
        {
            type: "category",
            axisLabel: {
                formatter: "{value} h",
            },
            data: [],
        },
    ],
    legend: {
        data: ["Demand"],  // add series names
    },
    series: [
        // add series
        {
            name: "Demand",
            type: "bar",
            stack: "",
            color: "rgba(175, 175, 175, 0.4)",
            data: [],  // 2D array, demand series
        },
    ],
};
chart_3_series_temp = {
    name: null,  // battery index
    type: "bar",
    stack: "Service",
    data: [],  // 2D array, output series
}

const rgba_green = 'rgba(175, 255, 175, 0.4)';
const rgba_red = 'rgba(255, 175, 175, 0.4)';
const rgba_grey = 'rgba(175, 175, 175, 0.4)';
const rgba_blank = 'rgba(255, 255, 255, 0)';

function draw_charts(A, P, H, Sc, Sd) {
    const figure_height = Math.round(0.65 * window.outerHeight);
    const figure_width = document.querySelector("ul[role=\"tablist\"]").offsetWidth;
    const canvas_1_set = document.getElementById('charge-hist');
    canvas_1_set.innerHTML = '';
    const m = A.length;
    const n = A[0].length - 1;
    const canvas_2_set = document.getElementById('power');
    canvas_2_set.innerHTML = '';
    let canvas_2 = document.createElement('div');
    canvas_2.style.height = `${figure_height}px`;
    canvas_2.style.width = `${figure_width}px`;
    canvas_2_set.appendChild(canvas_2);
    let chart_2 = echarts.init(canvas_2);
    let chart_2_option = structuredClone(chart_2_option_temp);
    chart_2_option['xAxis']['max'] = n;
    const canvas_3_set = document.getElementById('service');
    canvas_3_set.innerHTML = '';
    let canvas_3 = document.createElement('div');
    canvas_3.style.height = `${figure_height}px`;
    canvas_3.style.width = `${figure_width}px`;
    canvas_3_set.appendChild(canvas_3);
    let chart_3 = echarts.init(canvas_3);
    let chart_3_option = structuredClone(chart_3_option_temp);
    // chart_3_option['xAxis'][0]['max'] = n;
    chart_3_option['xAxis'][0]['data'] = zeros(n, 1).map((_, j) => j+1);
    // must be before the "i" loop
    chart_3_option['series'][0]['data'] = demand;
    for (let i = 0; i < m; i++) {
        let canvas_1 = document.createElement('div');
        canvas_1.style.height = `${figure_height}px`;
        canvas_1.style.width = `${figure_width}px`;
        canvas_1_set.appendChild(canvas_1);
        let chart_1 = echarts.init(canvas_1);
        let chart_1_option = structuredClone(chart_1_option_temp);
        chart_1_option['title']['text'] = `Battery ${i+1}`;
        chart_1_option['xAxis']['max'] = n;
        chart_1_option['yAxis']['max'] = energy_capacity[i];
        let lb = 0;
        let ub = 0;
        let status = [Sc[i][0], Sd[i][0]];
        let pieces_color;
        let mark_area_rgba;
        for (let j = 1; j < n; j++) {
            if (status[0] === Sc[i][j] && status[1] === Sd[i][j]) {
              continue
            }
            ub = j;
            if (status[0] === 0 && status[1] === 0) {  // idle
                pieces_color = 'grey';
                mark_area_rgba = rgba_grey;
            } else if (status[0] > 0 && status[1] === 0) {  // charging
                pieces_color = 'green';
                mark_area_rgba = rgba_green;
            } else if (status[0] === 0 && status[1] > 0) {  // discharging
                pieces_color = 'red';
                mark_area_rgba = rgba_red;
            } else {
                pieces_color = 'blank';
                mark_area_rgba = rgba_blank;
            }
            chart_1_option['visualMap']['pieces'].push({gt: lb, lte: ub, color: pieces_color});
            chart_1_option['series'][0]['markArea']['data'].push([{xAxis: lb, itemStyle: {color: mark_area_rgba}}, {xAxis: ub}]);
            lb = j;
            status = [Sc[i][j], Sd[i][j]];
        }
        ub = n;
        if (status[0] === 0 && status[1] === 0) {  // idle
            pieces_color = 'grey';
            mark_area_rgba = rgba_grey;
        } else if (status[0] > 0 && status[1] === 0) {  // charging
            pieces_color = 'green';
            mark_area_rgba = rgba_green;
        } else if (status[0] === 0 && status[1] > 0) {  // discharging
            pieces_color = 'red';
            mark_area_rgba = rgba_red;
        } else {
            pieces_color = 'blank';
            mark_area_rgba = rgba_blank;
        }
        chart_1_option['visualMap']['pieces'].push({gt: lb, lte: ub, color: pieces_color});
        chart_1_option['series'][0]['markArea']['data'].push([{xAxis: lb, itemStyle: {color: mark_area_rgba}}, {xAxis: ub}]);
        chart_1_option['series'][0]['data'] = A[i].map((val, idx) => [idx, val]);
        chart_1.setOption(chart_1_option);
        chart_2_option['legend']['data'].push(`Battery ${i+1}`);
        let chart_2_series = structuredClone(chart_2_series_temp);
        chart_2_series['name'] = `Battery ${i+1}`;
        chart_2_series['data'] = zeros(n, 1).map((_, j) =>
            [j+1, P[i][j] * (Sd[i][j] > 0) - H[i][j] * (Sc[i][j] > 0)]
        );
        chart_2_option['series'].push(chart_2_series);
        chart_3_option['legend']['data'].push(`Battery ${i+1}`);
        let chart_3_series = structuredClone(chart_3_series_temp);
        chart_3_series['name'] = `Battery ${i+1}`;
        chart_3_series['data'] = zeros(n, 1).map((_, j) =>
            P[i][j] * (Sd[i][j] > 0) - H[i][j] * (Sc[i][j] > 0)
        );
        chart_3_option['series'].push(chart_3_series);
    }
    chart_2.setOption(chart_2_option);
    chart_3.setOption(chart_3_option);
}