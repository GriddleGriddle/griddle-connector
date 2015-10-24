import GriddleRedux, {
  previousOrCombined,
  combinePlugins,
  composer,
  combineComponents
} from '../griddle-redux';

describe('GriddleRedux', () => {
  describe('previousOrCombined', () => {
    it('combines values if they exist', () => {
      const value = previousOrCombined(['one', 'two', 'three'], ['four', 'five']);
      expect(value).toEqual(['one', 'two', 'three', 'four', 'five']);
    });

    it('returns original value if additional value not specified', () => {
      const value = previousOrCombined(['one', 'two']);
      expect(value).toEqual(['one', 'two']);
    });

    it('is undefined if no parameters are specified', () => {
      const value = previousOrCombined();
      expect(value).toBe(undefined);
    });
  });

  describe('combinePlugins', () => {
    it('combines a series of plugins into one plugin', () => {
      const plugin1 = {
        reducers: ['rOne', 'rTwo'],
        states: ['sOne', 'sTwo'],
        helpers: ['hOne', 'hTwo'],
        components: ['cOne', 'cTwo']
      }

      const plugin2 = {
        reducers: ['rThree', 'rFour'],
        states: ['sThree', 'sFour'],
        helpers: ['hThree', 'hFour'],
        components: ['cThree', 'cFour']
      }

      const combinedPlugins = combinePlugins(plugin1, plugin2);

      expect(combinedPlugins.reducers).toEqual(['rOne', 'rTwo', 'rThree', 'rFour']);
      expect(combinedPlugins.states).toEqual(['sOne', 'sTwo', 'sThree', 'sFour']);
      expect(combinedPlugins.helpers).toEqual(['hOne', 'hTwo', 'hThree', 'hFour']);
      expect(combinedPlugins.components).toEqual(['cOne', 'cTwo', 'cThree', 'cFour']);
    });

    it('returns an empty array for any items that have no values', () => {
       const plugin1 = {
        reducers: ['rOne', 'rTwo'],
        states: ['sOne', 'sTwo'],
        helpers: ['hOne', 'hTwo']
      }

      const plugin2 = {
        reducers: ['rThree', 'rFour'],
        states: ['sThree', 'sFour'],
        helpers: ['hThree', 'hFour']
      }

      const combinedPlugins = combinePlugins(plugin1, plugin2);

      expect(combinedPlugins.reducers).toEqual(['rOne', 'rTwo', 'rThree', 'rFour']);
      expect(combinedPlugins.states).toEqual(['sOne', 'sTwo', 'sThree', 'sFour']);
      expect(combinedPlugins.helpers).toEqual(['hOne', 'hTwo', 'hThree', 'hFour']);
      expect(combinedPlugins.components).toEqual([]);
    });

    it('returns only results from plugins that have values', () => {
      const plugin = { components: ['one', 'two', 'three'] };
      const plugin2 = {};
      const plugin3 = { components: ['four', 'five'] }

      const combinedPlugins = combinePlugins(plugin, plugin2, plugin3);

      expect(combinedPlugins.components).toEqual(['one', 'two', 'three', 'four', 'five']);
    });
  });

  describe('composer', () => {
    it('applies functions in the order they are recieved', () => {
      const composed = composer(
        (input) => { return `${input}First`; },
        (input) => { return `${input}Second`; },
        (input) => {return `${input}Third`; }
      )("1");

      expect(composed).toEqual("1FirstSecondThird");
    });
  });

  describe('combineComponents', () => {
    it('returns undefined if plugins or components are not specified', () => {
      const withPlugins = combineComponents({plugins: ['one', 'two', 'three']});
      const withComponents = combineComponents({originalComponents: ['one', 'two', 'three']});

      expect(withPlugins).toBe(undefined);
      expect(withComponents).toBe(undefined);
    });

    it('wraps the components with plugins as expected', () => {
      const components = {
        one: "ONE",
        two: "TWO"
      }

      const plugins = {
        one: [
          (component) => (`1 ${component}`),
          (component) => (`${component} 2`),
          (component) => (`${component} 3`)
        ]
      }

      const combined = combineComponents({ plugins, components });
      expect(combined.one).toEqual('1 ONE 2 3');
    })
  })
});
