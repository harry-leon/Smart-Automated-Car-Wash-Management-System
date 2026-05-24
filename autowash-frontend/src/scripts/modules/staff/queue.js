const queue = [
  { code: "AW-1024", plate: "51G-12345", status: "Pending", service: "Premium Wash", time: "09:30" },
  { code: "AW-1025", plate: "30H-45678", status: "Checked-In", service: "Standard Wash", time: "10:00" },
  { code: "AW-1026", plate: "51B-88888", status: "In Progress", service: "Ceramic Care", time: "10:30" },
  { code: "AW-1021", plate: "59A-12121", status: "Completed", service: "Premium Wash", time: "08:15" },
];

export function initStaffQueue() {
  const board = document.querySelector("[data-queue-board]");
  if (!board) return;

  board.querySelectorAll("[data-status]").forEach((column) => {
    const status = column.dataset.status;
    const list = column.querySelector("[data-queue-list]");
    list.innerHTML = queue
      .filter((item) => item.status === status)
      .map(
        (item) => `
          <article class="queue-card">
            <h3>${item.code}</h3>
            <p>${item.plate} - ${item.service}</p>
            <p class="text-muted">Gio hen: ${item.time}</p>
          </article>
        `,
      )
      .join("");
  });
}
