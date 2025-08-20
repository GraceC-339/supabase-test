import  supabase from "./supabase-client";
import { useEffect, useState} from "react";
import { Chart} from "react-charts";
import Form from "./Form";

function Dashboard() {
    const [metrics, setMetrics] = useState([]);

    // Import useEffect and add this hook at the top of the Dashboard component. 
    useEffect(() => {
        // Call the 'fetchMetrics' function as the effect in this hook and have it run
		// only once after inital render.
        fetchMetrics();

        // Add this code to subscribe to changes in the 'sales_deals' table.
        const channel = supabase
        .channel('deal-changes')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'sales_deals' 
          },
          (payload) => {
            // Action
            fetchMetrics();
            // console.log('Realtime change:',payload.eventType, {new: payload.new, old: payload.old});
          })
        .subscribe();
  
      // Clean up subscription
      return () => {
        supabase.removeChannel(channel);
      };

    }, []);

    // 2) Wrap the Supabase client code in a 'fetchMetrics' asynchronous function.
    async function fetchMetrics(){
        try{
        const { data, error }= await supabase
            .from('sales_deals')
            .select(
                `
                name,
                value.sum()
                `,
            )
        // check Supabase-specific error
        if (error) {
            throw error; // escalate it to catch block
        }
        console.log(data);
        setMetrics(data);
        } catch(error){
            console.error('Error fetching metrics: ', error)
        }
    }


    const chartData = [
        {
            data: metrics.map((m)=>({
              primary: m.name,
              secondary: m.sum,
            })),
        },
    ];

    const primaryAxis = {
      getValue: (d) => d.primary,
      scaleType: 'band',
      padding: 0.2,
      position: 'bottom',
    };
  
    const secondaryAxes = [
      {
        getValue: (d) => d.secondary,
        scaleType: 'linear',
        min: 0,
        max: y_max(),
        padding: {
          top: 20,
          bottom: 40,
        },
      },
    ];

    function y_max() {
      if (metrics.length > 0) {
        const maxSum = Math.max(...metrics.map((m) => m.sum));
        return maxSum + 2000;
      }
      return 5000; 
    }

  return (
    <div className="dashboard-wrapper">
      <div className="chart-container">
        <h2>Total Sales This Quarter ($)</h2>
        <div style={{flex: 1}}>
            <Chart
            options={{
              data: chartData,
              primaryAxis,
              secondaryAxes,
              type: 'bar',
              defaultColors: ['#58d675'],
              tooltip: {
                show: false,
              },
            }}
            />
        </div>
      </div>
      <Form metrics={metrics} />
    </div>
  );
}

export default Dashboard;