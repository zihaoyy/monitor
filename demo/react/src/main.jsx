import {createRoot} from 'react-dom/client'
import ErrorBoundary from "./ErrorBoundary.js";

function App() {
    return (
        <ErrorBoundary fallback={<div>Something went wrong...</div>}>
            <Child/>
        </ErrorBoundary>
    )
}

function Child() {
    const list = {}
    return (
        <>
            子组件
            {list.map((item, key) => (
                <span key={key}>{item}</span>
            ))}
        </>
    )
}

createRoot(document.getElementById('root')).render(
    <App/>
)
