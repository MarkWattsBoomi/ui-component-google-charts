# Google Charts

This is a wrapper around the google charts library.

Partially tested.

Refer to google charts documentation for the 


## Setup

- Grab the files from the /dist folder and import into your tenant.

- Add the files to your player code like this: -

        requires: ['core', 'bootstrap3'],
        customResources: [
                'https://s3.amazonaws.com/files-manywho-com/tenant-id/GoogleCharts.js'
                ],


- Add a component to your page, any type, save it then change it's "componentType" to "GoogleChart" in the metadata editor and save it.
e.g. 
            "componentType": "CommentsList",

- Set the component's "Data Source" to the data you want to display..

- Set the display columns to the elements you want the chart based on.  The order and type are critical !! Refer to Google Charts documentation for details.

## Supported Chart Types
- AnnotationChart
- AreaChart
- BarChart
- BubbleChart
- Calendar
- CandlestickChart
- ColumnChart
- Gannt
- Gauge
- GeoChart
- LineChart
- OrgChart
- PieChart
- Sankey
- ScatterChart
- SteppedAreaChart
- Table
- TimeLine
- TreeMap
- ScatterChart
- WordTree


## Extra Configuration

You can add attributes to the component to control it's appearance: -

- chart - the name of the chart type to display from the list above.
