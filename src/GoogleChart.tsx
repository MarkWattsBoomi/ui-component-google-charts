declare var manywho: any;
//declare var google:any;

import * as React from 'react';
import Chart from 'react-google-charts';


class GoogleChart extends React.Component<any, any> 
{

    outcomes : any;
    
    onSearchChanged(e : any) 
    {
        if (this.props.isDesignTime)  return;

        manywho.state.setComponent(this.props.id, { search: e.target.value }, this.props.flowKey, true);
        this.forceUpdate();
    }

    onSearchEnter(e : any) 
    {
        if (e.keyCode == 13 && !this.props.isDesignTime) 
        {
            e.stopPropagation();
            this.search();
        }
    }

    search() 
    {
        if (this.props.isDesignTime) return;

        var model = manywho.model.getComponent(this.props.id, this.props.flowKey);
        var state = manywho.state.getComponent(this.props.id, this.props.flowKey);

        this.clearSelection();

        if (model.objectDataRequest) 
        {
            manywho.engine.objectDataRequest(this.props.id, model.objectDataRequest, this.props.flowKey, manywho.settings.global('paging.table'), state.search, null, null, state.page);
        }
        else 
        {
            var displayColumns = (manywho.component.getDisplayColumns(model.columns) || []).map(function(column : any) {
                return column.typeElementPropertyId.toLowerCase();
            });

            this.setState({
                objectData: model.objectData.filter(function(objectData : any) {

                    return objectData.properties.filter(function(property : any) {

                        return displayColumns.indexOf(property.typeElementPropertyId) != -1 && property.contentValue.toLowerCase().indexOf(state.search.toLowerCase()) != -1

                    }).length > 0

                })
            });

            state.page = 1;
            manywho.state.setComponent(this.props.id, state, this.props.flowKey, true);

        }
    }

    refresh() 
    {
        if (this.props.isDesignTime) return;

        manywho.state.setComponent(this.props.id, { search: '' }, this.props.flowKey, true);

        this.search();

    }

    clearSelection() 
    {
        this.setState({ selectedRows: [] });
        manywho.state.setComponent(this.props.id, { objectData: [] }, this.props.flowKey, true);
    }

    onRowClicked(e : any) 
    {
        var selectedRows = this.state.selectedRows;

        var model = manywho.model.getComponent(this.props.id, this.props.flowKey);

        if (selectedRows.indexOf(e.currentTarget.id) == -1) 
        {
            model.isMultiSelect ? selectedRows.push(e.currentTarget.id) : selectedRows = [e.currentTarget.id];
        }
        else 
        {
            selectedRows.splice(selectedRows.indexOf(e.currentTarget.id), 1);
        }

        this.setState({ selectedRows: selectedRows });
        manywho.state.setComponent(this.props.id, { objectData: manywho.component.getSelectedRows(model, selectedRows) }, this.props.flowKey, true);
    }

    onOutcome(objectDataId : any, outcomeId : any) 
    {

        var model = manywho.model.getComponent(this.props.id, this.props.flowKey);
        manywho.state.setComponent(model.id, { objectData: manywho.component.getSelectedRows(model, [objectDataId]) }, this.props.flowKey, true);

        var flowKey = this.props.flowKey;
        var outcome = manywho.model.getOutcome(outcomeId, this.props.flowKey);
        manywho.engine.move(outcome, this.props.flowKey)
            .then(function() {

                if (outcome.isOut) {

                    manywho.engine.flowOut(outcome, flowKey);

                }

            });
    }

    onNext() 
    {
        var model = manywho.model.getComponent(this.props.id, this.props.flowKey);
        var state = manywho.state.getComponent(this.props.id, this.props.flowKey);

        if (!state.page) 
        {
            state.page = 1;
        }

        state.page++;
        manywho.state.setComponent(this.props.id, state, this.props.flowKey, true);

        if (model.objectDataRequest || model.fileDataRequest)
            this.search();
        else if (model.attributes.pagination && manywho.utils.isEqual(model.attributes.pagination, 'true', true)) {
            this.forceUpdate();
        }

    }

    onPrev() 
    {
        var model = manywho.model.getComponent(this.props.id, this.props.flowKey);
        var state = manywho.state.getComponent(this.props.id, this.props.flowKey);
        state.page--;

        manywho.state.setComponent(this.props.id, state, this.props.flowKey, true);

        if (model.objectDataRequest || model.fileDataRequest)
            this.search();
        else if (model.attributes.pagination && manywho.utils.isEqual(model.attributes.pagination, 'true', true)) {
            this.forceUpdate();
        }

    }

    getInitialState() 
    {
        var ret : any = {};
        ret.selectedRows = [];
        ret.windowWidth = window.innerWidth,
        ret.sortByOrder = 'ASC',
        ret.lastOrderBy = '',
        ret.objectData = null
        return ret;
    }


    constructor(props : any)
    {
       super(props);
    }
    
    

    componentWillMount() 
    {
        var model = manywho.model.getComponent(this.props.id, this.props.flowKey);
        if (!model.objectDataRequest) 
        {
            this.setState({ objectData: model.objectData });
        }
    }

    componentDidMount() 
    {

        

    }

    

    componentWillReceiveProps(nextProps : any) 
    {
        var model = manywho.model.getComponent(nextProps.id, nextProps.flowKey);
        var state = this.props.isDesignTime ? { error: null, loading: false } : manywho.state.getComponent(this.props.id, this.props.flowKey) || {};

        if (!model.objectDataRequest && !model.fileDataRequest && manywho.utils.isNullOrWhitespace(state.search) && (manywho.utils.isNullOrWhitespace(state.page) || state.page == 1)) {

            this.setState({ objectData: model.objectData });

        }

    }
    
    componentWillUnmount() 
    {
    }

   
    
    render()
    {
        manywho.log.info('Rendering Google Chart: ' + this.props.id);

        var model = manywho.model.getComponent(this.props.id, this.props.flowKey);
        var state = this.props.isDesignTime ? { error: null, loading: false } : manywho.state.getComponent(this.props.id, this.props.flowKey) || {};

        this.outcomes = manywho.model.getOutcomes(this.props.id, this.props.flowKey);

        var objectData = this.props.isDesignTime ? [] : model.objectData;

        if (model.objectData) {

            objectData = model.objectData.map(function (modelItem : any) {

                var stateObjectData = state.objectData.filter(function (stateItem : any) {

                    return manywho.utils.isEqual(modelItem.externalId, stateItem.externalId) && manywho.utils.isEqual(modelItem.internalId, stateItem.internalId);

                })[0];

                if (stateObjectData) 
                {
                    return manywho.utils.extend({}, [modelItem, stateObjectData]);
                }
                else 
                {
                    return modelItem;
                }
            });

        }

        var displayColumns = (this.props.isDesignTime) ? [] : this.getDisplayColumns(model.columns, this.outcomes);
        var hasMoreResults = (model.objectDataRequest && model.objectDataRequest.hasMoreResults) || (model.fileDataRequest && model.fileDataRequest.hasMoreResults);
        var content = null;
        var rowOutcomes = this.outcomes.filter(function (outcome : any) { return !outcome.isBulkAction });
        var headerOutcomes = this.outcomes.filter(function (outcome : any) { return outcome.isBulkAction });

        if (state.error) 
        {
            content =   <div className= 'table-error'>
                            <p className='lead'>state.error.message</p>
                            <button className='btn btn-danger' onClick={this.search}>Retry</button>
                        </div>;
        }
        else if (displayColumns.length == 0) 
        {
            content =   <div className= 'table-error'>
                            <p className='lead'>'No display columns have been defined for this table'</p>
                        </div>;
        }
        else 
        {
            content = this.renderChart(objectData || [], rowOutcomes, displayColumns);

        }

        var classNames : any = [];

        if (model.isVisible == false)
        {
                classNames.push('hidden');
        }
        else
        {
            classNames = classNames.concat(manywho.styling.getClasses(this.props.parentId, this.props.id, "google-chart", this.props.flowKey));

            if (model.attributes && model.attributes.classes) 
            {
                classNames = classNames.join(' ') + ' ' + model.attributes.classes;
            }
            else 
            {
                classNames = classNames.join(' ');
            }

            var validationElement : any;
            if (typeof model.isValid !== 'undefined' && model.isValid == false) 
            {
                validationElement = <div className= 'has-error'>
                                        <span className= 'help-block' >{model.validationMessage}</span>
                                    </div>
            }

            if (model.isVisible == false) 
            {
                classNames += ' hidden';
            }

            var contentItems : any = [];
            contentItems.push(this.renderHeader(state.search, headerOutcomes, this.props.flowKey, model.isSearchable, this.onSearchChanged, this.onSearchEnter, this.search, (model.objectDataRequest || model.fileDataRequest), this.refresh, this.props.isDesignTime, model));
            contentItems.push(content);
            contentItems.push(this.renderFooter(state.page || 1, hasMoreResults, this.onNext, this.onPrev, this.props.isDesignTime));
            contentItems.push(this.renderWait());


            return  <div className={classNames}>
                        <div className='panel panel-default'>
                            <div className='panel-heading'>
                                <div className='panel-body'>
                                    <div>
                                        {contentItems}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
        }
    }

    parseBoolean(value : any) 
    {
        if (value == true || value == false) {
            return value;
        }

        if (value != null &&
            value.toLowerCase() == 'true') {
            return true;
        }

        return false;
    }

    convertToGoogleType(contentType : string) 
    {
        var googleType = 'string';

        if (contentType != null) 
        {
            contentType = contentType.toUpperCase();

            if (contentType == manywho.component.contentTypes.number) 
            {
                googleType = 'number';
            }
        }
        return googleType;
    }

    getDisplayColumns(columns : any, outcomes : any) 
    {
        var displayColumns = manywho.component.getDisplayColumns(columns) || [];

        if (outcomes.filter(function (outcome  :any) 
        {
            return !outcome.isBulkAction;
        }).length > 0) 
        {
            displayColumns.unshift('mw-outcomes');
        }

        return displayColumns;
    }

    areBulkActionsDefined(outcomes : any) 
    {
        return outcomes.filter(function (outcome : any) 
        {
            return outcome.isBulkAction;
        }).length != 0
    }

    renderHeader(searchValue : any, outcomes : any, flowKey : string, isSearchEnabled : boolean, onSearchChanged : any, 
            onSearchEntered : any, search : any, isObjectData : any, refresh : any, isDesignTime : any, model : any)
     {
        var lookUpKey = manywho.utils.getLookUpKey(flowKey);
        var headerElements = [];
        var searchElement : any;
        var outcomesElement : any;
        var refreshElement : any;
        var mainElement = document.getElementById(lookUpKey);

        if ((isObjectData &&
             model.attributes != null &&
             this.parseBoolean(model.attributes.enableRefresh) == true) ||
            (isObjectData &&
             model.attributes == null)) {

            var refreshDisabled = false;

            if (isDesignTime) refreshDisabled = true;

            refreshElement = <button className='btn btn-sm btn-default table-refresh' onClick={refresh} disabled={refreshDisabled}   ><span className= 'glyphicon glyphicon-refresh'></span></button>;

        }

        if (isSearchEnabled) 
        {

            var searchDisabled : boolean = false;

            if (isDesignTime) searchDisabled=true;
   
            searchElement = <div className='input-group table-search'>
                                <input type='text' className='form-control' value={searchValue}  placeholder='Search' onChange={onSearchChanged} onKeyUp={onSearchEntered}>
                                    <span className='input-group-btn'>
                                        <button className='btn btn-default' onClick={search} disabled={searchDisabled}>
                                            <span className='glyphicon glyphicon-search'></span>
                                        </button>
                                    </span>
                                </input>
                            </div>
        }

        if (outcomes) 
        {

            var outcomeElements = outcomes.map(function (outcome : any) 
            {
                return React.createElement(manywho.component.getByName('outcome'), { id: outcome.id, flowKey: flowKey });
            });

            outcomesElement =   <div className='table-outcomes' >
                                    {outcomeElements}
                                </div>
        }

        if (mainElement && mainElement.clientWidth < 768) {

            headerElements = [outcomesElement, searchElement, refreshElement];

        }
        else {

            headerElements = [refreshElement, searchElement, outcomesElement];

        }

        if (headerElements.length > 0) 
        {
            return  <div className='table-header clearfix' >
                        {headerElements}
                    </div>
        }
        else
        {
            return null;
        }
    }

    renderFooter(pageIndex : number, hasMoreResults : boolean, onNext : any, onPrev : any, isDesignTime : boolean) 
    {

        var footerElements = [];

        if (pageIndex > 1 || hasMoreResults) {

            footerElements.push(React.createElement(manywho.component.getByName('pagination'),
                {
                    pageIndex: pageIndex,
                    hasMoreResults: hasMoreResults,
                    containerClasses: 'pull-right',
                    onNext: onNext,
                    onPrev: onPrev,
                    isDesignTime: isDesignTime
                }
            ));

        }

        if (footerElements.length > 0) 
        {
            return  <div className='table-footer clearfix'>
                        {footerElements}
                    </div>
        }
        else
        {
            return null;
        }

    }

    renderChart(objectData : any , outcomes : any , displayColumns : any) 
    {
        var model = manywho.model.getComponent(this.props.id, this.props.flowKey);

        var width = "100%";
        var height = "100%";
        
        
        var data = [];
        //add the display columns
        var columns = [];
        if (displayColumns != null &&  displayColumns.length > 0) 
        {
            for (var i = 0; i < displayColumns.length; i++) 
            {
                columns.push(displayColumns[i].label);
            }
        }
        data.push(columns);
       
        if (objectData != null && objectData.length > 0) 
        {
            for (var i = 0; i < objectData.length; i++) 
            {
                if (objectData[i].properties != null && objectData[i].properties.length == columns.length) 
                {
                    
                    var row = [];

                    //loop over the display columns getting the objectData.property for that id
                    for (var k = 0; k < displayColumns.length; k++) 
                    {
                        for (var j = 0; j < objectData[i].properties.length; j++) {

                            if (objectData[i].properties[j].typeElementPropertyId == displayColumns[k].typeElementPropertyId) {

                                if (this.convertToGoogleType(displayColumns[k].contentType) == 'number') {
                                    var number = parseFloat(objectData[i].properties[j].contentValue);

                                    if (isNaN(number) == true) {
                                        number = 0;
                                    }

                                    row.push(number);
                                } else {
                                    row.push(objectData[i].properties[j].contentValue);
                                }
                                break;
                            }

                        }

                    }
                    data.push(row);
                }
            }
        }

        var chartType : any;

        if (model.attributes) 
        {
            var options : any = {};

            for(var key in  model.attributes)
            {
                switch(key)
                {
                    case "chart":
                        var chartTypeResult : any = this.chartNameToType(model.attributes[key]);
                        chartType = chartTypeResult.name;
                        for(var oKey in chartTypeResult.options)
                        {
                            options[oKey] = chartTypeResult.options[oKey];
                        }

                    break;

                    //exclude these
                    case "classes":
                        //do nothing
                        break;
                    
                    default:
                    options[key] = model.attributes[key];
                }
            }
        }
        else
        {
            chartType = "PieChart";
        }

        


        
        return  <div id={ this.props.id }>
                    <Chart chartType={chartType} width={width} height={height} legendToggle data={data} options={options} />
                </div>;
    }
  

    renderWait()
    {
        //return <{manywho.component.getByName('wait')}>
        //React.createElement(manywho.component.getByName('wait'), { isVisible: state.loading, message: state.loading && state.loading.message, isSmall: true }, null)
 
   
    }

    chartNameToType(name : string)
    {
        var result : any = {name : "", options: {}};
        switch(name)
        {
            case 'AnnotationChart': result.name = "AnnotationChart"; break;
            case 'AreaChart': result.name =  "AreaChart"; break;
            case 'BarChart': result.name =  "BarChart"; break;
            case 'StackedBarChart': result.name =  "BarChart"; result.options.isStacked=true;break;
            case 'BubbleChart': result.name =  "BubbleChart"; break;
            case 'Calendar': result.name =  "Calendar"; break;
            case 'CandlestickChart': result.name =  "CandlestickChart"; break;
            case 'ColumnChart': result.name =  "ColumnChart";  break;
            case 'Gannt': result.name =  "Gannt"; break;
            case 'Gauge': result.name =  "Gauge"; break;
            case 'GeoChart': result.name =  "GeoChart"; break;
            case 'LineChart': result.name =  "LineChart"; break;
            case 'OrgChart': result.name =  "OrgChart"; break;
            case 'PieChart': result.name =  "PieChart"; break;
            case 'Sankey': result.name =  "Sankey"; break;
            case 'ScatterChart': result.name =  "ScatterChart"; break;
            case 'SteppedAreaChart': result.name =  "SteppedAreaChart"; break;
            case 'Table': result.name = "Table"; break;
            case 'TimeLine': result.name =  "TimeLine"; break;
            case 'TreeMap': result.name =  "TreeMap"; break;
            case 'TrendLine': 
                result.options.trendlines={ 0: {} };
                result.name =  "ScatterChart";
                break;
            case 'WordTree': 
                result.options.wordtree= {format: 'implicit', word: 'cats' };
                result.name =  "WordTree";
                break;
            default: result.name =  "PieChart";
                break;
        }
        return result;
    }

}



manywho.component.register('GoogleChart', GoogleChart);

export default GoogleChart;

