import './Table.css'

export default function Table({ columns, data, emptyText = 'No data found', className = '', cardViewOnMobile = false }) {
  return (
    <div className={`table-container ${cardViewOnMobile ? 'table-container-card-mobile' : ''} ${className}`}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="table-th" style={col.width ? { width: col.width } : {}}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className="table-row">
                {columns.map((col) => (
                  <td key={col.key} className="table-td">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {cardViewOnMobile && (
        <div className="table-cards">
          {data.length === 0 ? (
            <div className="table-cards-empty">{emptyText}</div>
          ) : (
            data.map((row, idx) => (
              <div key={idx} className="table-card">
                {columns.map((col) => (
                  <div key={col.key} className="table-card-row">
                    <span className="table-card-label">{col.label}</span>
                    <span className="table-card-value">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
