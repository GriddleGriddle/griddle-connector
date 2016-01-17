//TODO: Move most of this functionality to the component or something like that :|
export function columnPropertiesFromArray(columns) {
  //TODO: Make this more efficient -- this is just kind of make it work at this point
  let properties = {};
  columns.forEach(column => properties[column] = ({id: column}));

  return properties;
}

export function buildColumnProperties({ rowProperties, allColumns, defaultColumns}) {
  let columnProperties = defaultColumns ? columnPropertiesFromArray(defaultColumns) : {};

  if(rowProperties && rowProperties.props && !!rowProperties.props.children && Array.isArray(rowProperties.props.children)) {
    columnProperties = rowProperties.props.children.reduce((previous, current) => {
      previous[current.props.id] = current.props; return previous;
    }, columnProperties)
  } else if (rowProperties && rowProperties.props && rowProperties.props.children) {
  //if just an object
    columnProperties[rowProperties.props.children.props.id] = rowProperties.props.children.props;
  }

  //TODO: Don't check this this way :|
  if(Object.keys(columnProperties).length === 0 && allColumns) {
    columnProperties = columnPropertiesFromArray(allColumns);
  }

  return columnProperties;
}

const PropertyHelper = {
  propertiesToJS({ rowProperties, allColumns, defaultColumns, ignoredColumns=[] }) {
    const getHiddenColumns = columnProperties => {
      const visibleKeys = Object.keys(columnProperties);
      const hiddenColumns = allColumns.filter(column => visibleKeys.indexOf(column) < 0);

      let hiddenColumnProperties = {};
      hiddenColumns.forEach(column => hiddenColumnProperties[column] = {id: column});

      return hiddenColumnProperties;
    }

    const ignoredColumnsWithChildren = ignoredColumns.indexOfChildren > -1 ? ignoredColumns : [...ignoredColumns, 'children']
    //if we don't have children return an empty metatdata object
    if(!rowProperties) {
      const columnProperties = columnPropertiesFromArray(defaultColumns || allColumns);
      const hiddenColumnProperties = getHiddenColumns(columnProperties);

      return {
        rowProperties: null,
        columnProperties,
        ignoredColumns: ignoredColumnsWithChildren,
        hiddenColumnProperties: hiddenColumnProperties
      };
    }
    const columnProperties = buildColumnProperties({ rowProperties, allColumns, defaultColumns });

    var rowProps = Object.assign({}, rowProperties.props);
    delete rowProps.children;

    if (!rowProps.hasOwnProperty('childColumnName')) {
      rowProps.childColumnName = 'children';
    }

    const hiddenColumnProperties = getHiddenColumns(columnProperties);

    //make sure that children is in the ignored column list

    return {
      rowProperties: rowProps,
      columnProperties,
      hiddenColumnProperties,
      ignoredColumns: ignoredColumnsWithChildren,
      metadataColumn: '__metadata'
    };
  }
};

export default PropertyHelper;
