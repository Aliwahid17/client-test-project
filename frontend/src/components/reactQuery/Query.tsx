'use client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Suspense, lazy, useState } from "react"

export const queryClient = new QueryClient()

const ReactQueryDevtoolsProduction = lazy(() =>
    import('@tanstack/react-query-devtools/build/modern/production.js').then(
        (d) => ({
            default: d.ReactQueryDevtools,
        }),
    ),
)

interface QueryProps {
    children: React.ReactNode
}

const Query = ({ children }: QueryProps) => {

    const [showDevtools, setShowDevtools] = useState(process.env.NODE_ENV === 'development')

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {showDevtools && (
                <Suspense fallback={null}>
                    <ReactQueryDevtoolsProduction />
                </Suspense>
            )}
        </QueryClientProvider>
    )
}

export default Query