import * as Helpers from '../propertyHelper';

describe ('PropertyHelper', () => {
  describe('buildColumnProperties', () => {
    it('sets an array of properties when children are an array', () => {
      const rowProperties = {
        props: {
          children: [
            { props: { id: 1, name: "one"}},
            { props: { id: 2, name: "two"}}
          ]
        }
      }
      const columnProperties = Helpers.buildColumnProperties({ rowProperties });

      expect(columnProperties).toEqual({
        1: { id: 1, name: "one"},
        2: { id: 2, name: "two"}
      });
    });
  });

  it('sets a single property when children is one item', () => {
       const rowProperties = {
        props: {
          children: { props: { id: 2, name: "two"}}
        }
      }

      const columnProperties = Helpers.buildColumnProperties({ rowProperties });

      expect(columnProperties).toEqual({ 2: { id: 2, name: "two"}});
  });

  it('builds column properties for column array if no children specified', () => {
    const rowProperties = null;
    const columnProperties = Helpers.buildColumnProperties({ rowProperties, allColumns: ['one', 'two', 'three'] });
    expect(columnProperties).toEqual({
      one: { id: 'one' },
      two: { id: 'two' },
      three: { id: 'three' }
    });
  });

  it('uses default columns if specified', () => {
    const defaultColumns = ['one', 'two', 'three'];
    const columnProperties = Helpers.buildColumnProperties({ defaultColumns });

    expect(columnProperties).toEqual({
      one: { id: 'one' },
      two: { id: 'two' },
      three: { id: 'three' }
    });
  });

  it('overrides default columns with columnProperties', () => {
    const defaultColumns = ['one', 'two', 'three'];
    const rowProperties = {
      props: {
        children: [
          { props: { id: 'one', name: "ichi"}},
        ]
      }
    }
    const columnProperties = Helpers.buildColumnProperties({ defaultColumns });

    expect(columnProperties).toEqual({
      one: { id: 'one' },
      two: { id: 'two' },
      three: { id: 'three' }
    });
  });
});
