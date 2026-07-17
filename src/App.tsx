import { TableProvider } from './context/TableContext';
import { EditableDataTable } from './components/EditableDataTable/EditableDataTable';
import './index.css';

function App() {
  return (
    <TableProvider>
      <main className="app">
        <EditableDataTable />
      </main>
    </TableProvider>
  );
}

export default App;
