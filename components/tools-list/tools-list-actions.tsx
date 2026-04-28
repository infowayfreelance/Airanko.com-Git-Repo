'use client'

import { Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ToolsListActions() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      <Button onClick={handlePrint} className="gap-2">
        <Download className="h-4 w-4" />
        Save as PDF
      </Button>
      <Button onClick={handlePrint} variant="outline" className="gap-2">
        <Printer className="h-4 w-4" />
        Print
      </Button>
      <p className="text-xs text-muted-foreground">
        Tip: in the print dialog, choose &quot;Save as PDF&quot; as the
        destination.
      </p>
    </div>
  )
}
