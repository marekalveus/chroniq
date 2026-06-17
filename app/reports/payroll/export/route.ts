import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import * as XLSX from "xlsx";

function hoursOf(session: any) {
  if (session.total_hours != null) return Number(session.total_hours);
  if (!session.start_time || !session.end_time) return 0;

  const start = new Date(session.start_time).getTime();
  const end = new Date(session.end_time).getTime();

  return Math.max(0, (end - start) / 1000 / 60 / 60);
}

export async function GET(request: NextRequest) {
  const monthParam = request.nextUrl.searchParams.get("month");

  const now = new Date();
  const month =
    monthParam ??
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [year, monthNumber] = month.split("-").map(Number);

  const start = new Date(year, monthNumber - 1, 1);
  const end = new Date(year, monthNumber, 1);

  const { data: workers } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  const { data: sessions } = await supabaseAdmin
    .from("work_sessions")
    .select("*, objects(name, object_type)")
    .not("end_time", "is", null)
    .gte("start_time", start.toISOString())
    .lt("start_time", end.toISOString());

  const rows =
    workers?.map((worker) => {
      const workerSessions =
        sessions?.filter((s) => s.worker_id === worker.id) ?? [];

      let regularHours = 0;
      let regularAmount = 0;

      let regularNightHours = 0;
      let regularNightAmount = 0;

      let shipHours = 0;
      let shipAmount = 0;

      let shipNightHours = 0;
      let shipNightAmount = 0;

      let drivenKm = 0;
      let kmCompensation = 0;

      for (const session of workerSessions) {
        const h = hoursOf(session);
        const rate = Number(session.hourly_rate_snapshot ?? 0);
        const amount = h * rate;

        const isShip =
          session.base_pay_type === "ship" ||
          session.objects?.object_type === "ship";

        const isNight = session.pay_type === "night" || session.is_night_work;

        if (isShip && isNight) {
          shipNightHours += h;
          shipNightAmount += amount;
        } else if (isShip) {
          shipHours += h;
          shipAmount += amount;
        } else if (isNight) {
          regularNightHours += h;
          regularNightAmount += amount;
        } else {
          regularHours += h;
          regularAmount += amount;
        }

        drivenKm += Number(session.driven_km ?? 0);
        kmCompensation += Number(session.km_compensation ?? 0);
      }

      const totalHours =
        regularHours + regularNightHours + shipHours + shipNightHours;

      const salaryTotal =
        regularAmount + regularNightAmount + shipAmount + shipNightAmount;

      const payableTotal = salaryTotal + kmCompensation;

      return {
        Töötaja: worker.full_name,

        "Tava hind": Number(Number(worker.regular_rate ?? 0).toFixed(2)),
        "Tava h": Number(regularHours.toFixed(2)),
        "Tava kokku": Number(regularAmount.toFixed(2)),

        "Tava öö h": Number(regularNightHours.toFixed(2)),
        "Tava öö kokku": Number(regularNightAmount.toFixed(2)),

        "Laeva hind": Number(Number(worker.ship_rate ?? 0).toFixed(2)),
        "Laev h": Number(shipHours.toFixed(2)),
        "Laev kokku": Number(shipAmount.toFixed(2)),

        "Laev öö h": Number(shipNightHours.toFixed(2)),
        "Laev öö kokku": Number(shipNightAmount.toFixed(2)),

        "Kokku h": Number(totalHours.toFixed(2)),
        "Palk kokku": Number(salaryTotal.toFixed(2)),

        Km: Number(drivenKm.toFixed(1)),
        "Auto komp": Number(kmCompensation.toFixed(2)),

        "Maksta kokku": Number(payableTotal.toFixed(2)),
      };
    }) ?? [];

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Palgakoond");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="palgakoond-${month}.xlsx"`,
    },
  });
}
