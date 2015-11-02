function buildColumnProperties(allColumns) {
  //TODO: Make this more efficient -- this is just kind of make it work at this point
  let properties = {};
  allColumns.forEach(column => properties[column] = ({id: column}));

  return properties;
}

const PropertyHelper = {
  propertiesToJS(row, allColumns) {
    //if we don't have children return an empty metatdata object
    if(!row) {
      return {
        rowProperties: null,
        columnProperties: buildColumnProperties(allColumns)
      };
    }

    let columnProperties = {};

    //TODO: Document what this does and clean it up. Can't really see anyone just being able to 'reason about' what this is doing too easily :)
    //if an array
    if(!!row.props.children && Array.isArray(row.props.children)) {
      row.props.children.forEach(child => columnProperties[child.props.id] = child.props);
    } else if (row.props.children) {
    //if just an object
      columnProperties[row.props.children.props.id] = row.props.children.props;
    }

    var rowProps = Object.assign({}, row.props);
    delete rowProps.children;

    if (!rowProps.hasOwnProperty('childColumnName')) {
      rowProps.childColumnName = 'children';
    }

    //TODO: Don't check this this way :|
    if(Object.keys(columnProperties).length === 0) {
      columnProperties = buildColumnProperties(allColumns);
    }

    const visibleKeys = Object.keys(columnProperties);
    //make new column properties for all of the columns that are in the props collection
    //TODO: make a property on griddle that will say only show the columns that have a column definition
    const hiddenColumns = allColumns.filter(column => visibleKeys.indexOf(column) < 0);

    let hiddenColumnProperties = {};
    hiddenColumns.forEach(column => hiddenColumnProperties[column] = {id: column});

    const ignoredColumns = ['children']

    return {
      rowProperties: rowProps,
      columnProperties,
      hiddenColumnProperties,
      ignoredColumns
    };
  }
};

export default PropertyHelper;
