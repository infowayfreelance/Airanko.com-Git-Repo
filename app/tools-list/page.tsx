import type { Metadata } from 'next'
import { TOOL_CATEGORIES, TOTAL_TOOL_COUNT } from '@/lib/tools-data'
import { ToolsListActions } from '@/components/tools-list/tools-list-actions'

export const metadata: Metadata = {
  title: 'Free Browser-Based Tools — Master List',
  description:
    'A complete list of free, in-browser tools you can build with no API keys, no servers, and no ongoing costs. Save as PDF to keep a copy.',
}

export default function ToolsListPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-12 print:px-0 print:py-0">
        <header className="mb-10 flex flex-col gap-6 print:mb-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Master List
            </p>
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Free Browser-Based Tools
            </h1>
            <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              Every tool idea discussed — {TOTAL_TOOL_COUNT}+ free tools across{' '}
              {TOOL_CATEGORIES.length} categories. Each one runs fully in the
              user&apos;s browser using open-source libraries. No API keys, no
              servers, no per-use fees.
            </p>
          </div>

          <ToolsListActions />
        </header>

        <div className="flex flex-col gap-12 print:gap-8">
          {TOOL_CATEGORIES.map((category, idx) => (
            <section
              key={category.title}
              className="break-inside-avoid print:break-inside-avoid"
            >
              <div className="mb-4 border-b border-border pb-3">
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  <span className="mr-3 text-muted-foreground">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  {category.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {category.subtitle} ({category.tools.length} tools)
                </p>
              </div>

              <div className="overflow-hidden rounded-lg border border-border print:rounded-none print:border-0">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 print:bg-transparent">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Tool</th>
                      <th className="px-4 py-2 font-semibold">
                        Library / API
                      </th>
                      <th className="hidden px-4 py-2 font-semibold md:table-cell print:table-cell">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.tools.map((tool) => (
                      <tr
                        key={tool.name}
                        className="border-t border-border align-top"
                      >
                        <td className="px-4 py-2 font-medium">{tool.name}</td>
                        <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                          {tool.library}
                        </td>
                        <td className="hidden px-4 py-2 text-muted-foreground md:table-cell print:table-cell">
                          {tool.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-16 border-t border-border pt-6 text-sm text-muted-foreground print:mt-8">
          <p>
            All tools listed above can be built with open-source libraries that
            run entirely on the user&apos;s device. No paid APIs are required.
          </p>
        </footer>
      </div>
    </main>
  )
}
