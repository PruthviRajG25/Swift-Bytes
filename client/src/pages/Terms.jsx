import { CANTEEN } from '../config/canteen';

const Terms = () => {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-extrabold text-dark">Terms & Conditions</h1>
      <p className="mt-2 text-sm text-neutral-500">
        These Terms govern your use of SwiftBites Bites at {CANTEEN.name}.
      </p>

      <section className="mt-8 space-y-3 text-sm text-neutral-700">
        <h2 className="text-base font-bold text-dark">Ordering</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Orders are accepted only when the canteen is open.</li>
          <li>Token numbers are for pickup sequencing and do not guarantee an exact time.</li>
          <li>Optional instructions are best-effort and may not always be possible.</li>
        </ul>
      </section>

      <section className="mt-6 space-y-3 text-sm text-neutral-700">
        <h2 className="text-base font-bold text-dark">Payments</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Cash payments are collected at pickup.</li>
          <li>UPI payments can be made using the UPI link shown in the invoice (if selected).</li>
          <li>Payment status may be marked by the admin after verification at pickup.</li>
        </ul>
      </section>

      <section className="mt-6 space-y-3 text-sm text-neutral-700">
        <h2 className="text-base font-bold text-dark">Cancellations & refunds</h2>
        <p>
          If an order cannot be fulfilled due to item unavailability, the canteen may offer an
          alternative or cancel the item/order. Refunds (if any) are handled offline by the canteen
          staff.
        </p>
      </section>

      <section className="mt-6 space-y-3 text-sm text-neutral-700">
        <h2 className="text-base font-bold text-dark">Acceptable use</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Do not misuse the service (spam orders, fake payments, or abuse staff).</li>
          <li>Admins may suspend accounts for repeated misuse.</li>
        </ul>
      </section>

      <p className="mt-10 text-xs text-neutral-400">
        Last updated: {new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
      </p>
    </main>
  );
};

export default Terms;
