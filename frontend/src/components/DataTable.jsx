const KIND_COLORS = {
    numeric: 'badge-numeric',
    categorical: 'badge-categorical',
    datetime: 'badge-datetime',
    boolean: 'badge-boolean',
}

export default function DataTable({ columns, rows, dataTypes }) {
    if (!rows || rows.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No data to display.
            </div>
        )
    }

    return (
        <div className="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th style={{ minWidth: 50 }}>#</th>
                        {columns.map((col) => {
                            const kind = dataTypes?.[col]?.kind || 'categorical'
                            return (
                                <th key={col}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        <span>{col}</span>
                                        <span className={`badge ${KIND_COLORS[kind] || 'badge-categorical'}`}>
                                            {kind}
                                        </span>
                                    </div>
                                </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i}>
                            <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{i + 1}</td>
                            {columns.map((col) => {
                                const val = row[col]
                                const isEmpty = val === null || val === undefined || val === ''
                                return (
                                    <td key={col} className={isEmpty ? 'empty' : ''} title={isEmpty ? 'null/empty' : String(val)}>
                                        {isEmpty ? 'null' : String(val)}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
