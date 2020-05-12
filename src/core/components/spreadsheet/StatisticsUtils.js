import { histogram } from 'd3-array';

const TEXT_NUM_TOKENS = 5;
const DEFAULT_NUM_BINS = 20;
const DEFAULT_TICK_PRECISION = 6;
const numericTypes = new Set(['int', 'real']);

/**
 * Removes small floating point error and keep the numeric value at a fixed precision.
 * This is to ensure that chart ticks are nicely displayed.
 */
// const removeSmallError = (v: number): number => {
const removeSmallError = (v) => {
    return +v.toFixed(DEFAULT_TICK_PRECISION);
};
/**
 * Executes a binary search to find index of the bin which the given
 * value belongs.
 */
function findBinIndex(
    value,
    bins, // : {name: PrimitiveValue, count: number}[],
) { // : number {
    let li = 0;
    let ri = bins.length - 1;
    while (li <= ri) {
    const mi = (li + ri) >> 1;
    if (bins[mi].name <= value) {
        li = mi + 1;
    } else {
        ri = mi - 1;
    }
    }
    return ri;
}
// Compute summary statistics to generate the plots.
export function profile (dataset) {
    const numBins = DEFAULT_NUM_BINS;
    const columns = dataset.columns;
    const columnsStats = columns.reduce((prev, c) => {
        prev[c.id] = {
          column: c,
          values: [],
          valuesIndex: {},
          binSize: -1,
          stats: {
            count: 0,
            distinctValueCount: 0,
            sum: 0,
            mean: 0,
            stdDev: 0,
            min: Infinity,
            max: -Infinity,
          },
        };
        return prev;
      }, {});
    
    const dictionaries = {};
    for (let ridx = 0; ridx < dataset.rows.length; ridx++) {
        const row = dataset.rows[ridx];
        for (let cidx = 0; cidx < columns.length; cidx++) {
          const column = columns[cidx]; // column: {id: 0, name: "YEAR", type: "int"}
          let value = row.values[cidx];
          const colIndex = column.id;
          const columnInfo = columnsStats[colIndex];
          const stats = columnInfo.stats;
          if (numericTypes.has(column.type)) {
            value = +value;
            if (!isNaN(value)) {
              stats.min = Math.min(stats.min, value);
              stats.max = Math.max(stats.max, value);
              stats.sum += value;
            }
          } else if (column.type === 'datetime') {
            value = new Date(value).getTime();
            if (!isNaN(value)) {
              stats.min = Math.min(stats.min, value);
              stats.max = Math.max(stats.max, value);
              stats.sum += value;
            }
          } else if (value) {  
                let info = columnInfo.valuesIndex[value.toString()] || 0;
                info += 1;
                columnInfo.valuesIndex[value.toString()] = info;
          }
          stats.count += 1;
        }
      }

      Object.keys(columnsStats).map(k => {
        const column = columnsStats[k];
        if (numericTypes.has(column.column.type) || column.column.type === 'datetime') {
          const stats = column.stats;
          // Use d3 histogram to generate human-readable bins.
          const bins = histogram()
            .domain([stats.min, stats.max])
            .thresholds(numBins)([]); // pass an empty array just to generate the bin coordinates
          if (!bins.length) {
            console.warn('empty numeric column');
            column.values = [];
            column.binSize = 0;
            stats.mean = NaN;
            return;
          }

          // Avoid using the first or last bin to estimate bin size.
          column.binSize = bins.length >= 3 ? bins[2].x0 - bins[1].x0 : bins[0].x1 - bins[0].x0;
          column.binSize = removeSmallError(column.binSize);
          
          // The first and last bin may have uneven size.
          // We must make them even otherwise recharts bars may not work properly (bar width extremely thin).
          bins[0].x0 = bins[0].x1 - column.binSize;
          bins[bins.length - 1].x1 = bins[bins.length - 1].x0 + column.binSize;
          const newValues = bins.map(b => ({ name: removeSmallError(b.x0), count: 0 }));
          column.values = newValues;
          stats.mean = stats.sum / stats.count;
        }
      });

      for (let ridx = 0; ridx < dataset.rows.length; ridx++) {
        const row = dataset.rows[ridx];
        for (let cidx = 0; cidx < columns.length; cidx++) {
          const column = columns[cidx]; // column: {id: 0, name: "YEAR", type: "int"}
          const value =
              column.type === 'datetime'
              ? new Date(row.values[cidx].toString()).getTime()
              : row.values[cidx];
          const colIndex = column.id;
          const stats = columnsStats[colIndex];
          stats.stats.stdDev += Math.pow(+value - stats.stats.mean, 2);
          if (numericTypes.has(column.type) || column.type === 'datetime') {
            const binIndex = findBinIndex(value, stats.values);
            if (binIndex >= 0) {
              stats.values[binIndex].count++;
            }
          }
        };
      }

      return Object.keys(columnsStats).map(k => {
        const column = columnsStats[k];
        if (numericTypes.has(column.column.type) || column.column.type === 'datetime') {
          column.stats.stdDev = Math.sqrt(column.stats.stdDev / column.stats.count);
        } else {
          column.values = Object.keys(column.valuesIndex).map(ck => ({
            name: ck,
            count: column.valuesIndex[ck],
          }));
          column.stats.distinctValueCount = column.values.length;
        }
        delete column.valuesIndex;
        return column;
      });
}
