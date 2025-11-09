import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Connection, Request } from 'npm:tedious'

const config = {
  server: Deno.env.get('VITE_SQL_SERVER_URL'),
  authentication: {
    type: 'default',
    options: {
      userName: Deno.env.get('VITE_SQL_SERVER_USER'),
      password: Deno.env.get('VITE_SQL_SERVER_PASSWORD'),
    },
  },
  options: {
    port: Number(Deno.env.get('VITE_SQL_SERVER_PORT')),
    database: Deno.env.get('VITE_SQL_SERVER_DB'),
    encrypt: true,
  },
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const connection = new Connection(config)
    const data = await new Promise((resolve, reject) => {
      connection.on('connect', (err) => {
        if (err) {
          console.error(err)
          reject(new Error(err.message))
          return
        }

        const sql = `
          with base as
          (select
            f.LoandiskLoanApplicationId,
            f.LoanReleaseDate,
            f.RequestStatusId,
            f.RequestStatus,
            f.LoanPrincipalAmount,
            f.LoanTotalAmountDue,
            f.LoanTotalPaid,
            f.LoanPendingDue,
            f.MugaDecision,
            YEAR(f.LoanReleaseDate) AS LoanReleasedYear,
            MONTH(f.LoanReleaseDate) AS LoanReleasedMonth
          FROM
            Dw.ViewMugaFeedback f
          where
            f.LoandiskLoanApplicationId is not null
            AND f.RequestStatusId = 7 -- Funded;
          -- RequestStatusId=6 (Approved) also has some repayments but not always, we will ignore
          ),
          
          detailed AS 
          (SELECT
            b.LoandiskLoanApplicationId,
            b.LoanReleaseDate,
            b.LoanPrincipalAmount,
            b.LoanTotalAmountDue,
            b.LoanTotalPaid,
            b.LoanPendingDue,
            b.LoanReleasedYear,
            b.LoanReleasedMonth,
            b.MugaDecision,
            SUM(h.RepaymentAmount) AS TotalRepaymentAmount,
            SUM(
              CASE
                WHEN DATEDIFF(month, b.LoanReleaseDate, h.RepaymentCollectedDate) <= 1 THEN h.RepaymentAmount
                ELSE 0
              END
            ) AS RepaymentAmount1M,
            SUM(
              CASE
                WHEN DATEDIFF(month, b.LoanReleaseDate, h.RepaymentCollectedDate) <= 3 THEN h.RepaymentAmount
                ELSE 0
              END
            ) AS RepaymentAmount3M,
            SUM(
              CASE
                WHEN DATEDIFF(month, b.LoanReleaseDate, h.RepaymentCollectedDate) <= 6 THEN h.RepaymentAmount
                ELSE 0
              END
            ) AS RepaymentAmount6M,
            SUM(
              CASE
                WHEN DATEDIFF(month, b.LoanReleaseDate, h.RepaymentCollectedDate) <= 12 THEN h.RepaymentAmount
                ELSE 0
              END
            ) AS RepaymentAmount12M
          FROM
          base b
          LEFT JOIN Dw.ViewRepaymentHistory h
          ON 
            b.LoandiskLoanApplicationId = h.LoandiskLoanApplicationId
          GROUP BY
            b.LoandiskLoanApplicationId,
            b.LoanReleaseDate,
            b.LoanPrincipalAmount,
            b.LoanReleasedYear,
            b.LoanReleasedMonth,
            b.MugaDecision,
            b.LoanTotalAmountDue,
            b.LoanTotalPaid,
            b.LoanPendingDue
          ),
          
          triangle as 
          (SELECT
            LoanReleasedYear,
            LoanReleasedMonth,
            MugaDecision,
            COUNT(*) as NbLoans,
            SUM(LoanPrincipalAmount) as LoanPrincipalAmount,
            SUM(LoanTotalAmountDue) as LoanTotalAmountDue,
            SUM(
              CASE WHEN DATEDIFF(month, d.LoanReleaseDate, GETDATE()) >= 3 THEN RepaymentAmount3M ELSE NULL END
            ) as RepaymentAmount3M,
            SUM(
              CASE WHEN DATEDIFF(month, d.LoanReleaseDate, GETDATE()) >= 6 THEN RepaymentAmount6M ELSE NULL END
            ) as RepaymentAmount6M,
            SUM(
              CASE WHEN DATEDIFF(month, d.LoanReleaseDate, GETDATE()) >= 12 THEN RepaymentAmount12M ELSE NULL END
            ) as RepaymentAmount12M
          --   SUM(RepaymentAmount3M) / SUM(LoanPrincipalAmount) AS PercentageOfPrincipalRepaid3M,
          --   SUM(RepaymentAmount3M) / SUM(LoanTotalAmountDue) AS PercentageOfAmountDueRepaid3M,
          --   SUM(RepaymentAmount3M) / COUNT(*) as AvgRepaymentAmount3M,
          --   SUM(LoanTotalAmountDue) / COUNT(*) as AvgLoanTotalAmountDue,
          --   (SUM(LoanTotalAmountDue) - SUM(RepaymentAmount3M)) / COUNT(*) as AvgLoanPendingDue3M
          FROM
            detailed d
          GROUP BY
            MugaDecision,
            LoanReleasedYear,
            LoanReleasedMonth
          )
            
          SELECT
            *,
            LoanPrincipalAmount / NbLoans as AvgLoanPrincipalAmount,
            LoanTotalAmountDue / NbLoans as AvgLoanTotalAmountDue,
            RepaymentAmount3M / NbLoans as AvgRepaymentAmount3M,
            (LoanTotalAmountDue - RepaymentAmount3M) / NbLoans as AvgLoanPendingDue3M,
            RepaymentAmount6M / NbLoans as AvgRepaymentAmount6M,
            (LoanTotalAmountDue - RepaymentAmount6M) / NbLoans as AvgLoanPendingDue6M,
            RepaymentAmount12M / NbLoans as AvgRepaymentAmount12M,
            (LoanTotalAmountDue - RepaymentAmount12M) / NbLoans as AvgLoanPendingDue12M
          FROM
            triangle
          ORDER BY
            LoanReleasedYear,
            LoanReleasedMonth,
            MugaDecision
        `
        const request = new Request(sql, (err) => {
          if (err) {
            console.error(err)
            reject(new Error(err.message))
          }
          connection.close()
        })

        const results: any[] = []
        request.on('row', (columns) => {
          const row: any = {}
          columns.forEach((column) => {
            row[column.metadata.colName] = column.value
          })
          results.push(row)
        })

        request.on('doneProc', () => {
          resolve(results)
        })

        connection.execSql(request)
      })
      connection.connect()
    })

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
