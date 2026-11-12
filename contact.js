// Contact page: the copy button for the email address, and the "Send feedback"
// button, which marks the form as feedback so the message arrives with its own subject.
(() => {
    // --- Copy the email address ---
    const copy = document.querySelector('.reach-copy');
    if (copy) {
        const notice = document.querySelector('.reach-copied span');
        let timer = 0;

        // Older browsers and insecure pages have no clipboard API: copy through a hidden field.
        function legacyCopy(text) {
            const field = document.createElement('textarea');
            field.value = text;
            field.setAttribute('readonly', '');
            field.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
            document.body.append(field);
            field.select();
            let done = false;
            try { done = document.execCommand('copy'); } catch {}
            field.remove();
            return done;
        }

        function copied() {
            copy.classList.add('is-copied');
            if (notice) notice.hidden = false;
            clearTimeout(timer);
            timer = setTimeout(() => {
                copy.classList.remove('is-copied');
                if (notice) notice.hidden = true;
            }, 2000);
        }

        copy.addEventListener('click', async () => {
            const text = copy.dataset.copy;
            try {
                await navigator.clipboard.writeText(text);
                copied();
            } catch {
                // If nothing can copy, the address stays readable right next to the button.
                if (legacyCopy(text)) copied();
            }
        });
    }

    // --- Feedback ---
    const form = document.querySelector('.message-form');
    const button = document.querySelector('.reach-feedback-button');
    if (!form || !button) return;
    const subject = form.querySelector('input[name="_subject"]');
    const note = form.querySelector('.form-mode');
    const cancel = form.querySelector('.form-mode-cancel');
    if (!subject || !note || !cancel) return;
    const normalSubject = subject.value;

    function setFeedback(on) {
        subject.value = on ? "Feedback from Zaid Hsaine's portfolio" : normalSubject;
        note.hidden = !on;
    }

    button.addEventListener('click', () => {
        setFeedback(true);
        const first = form.querySelector('#sender-name');
        const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
        form.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' });
        if (first) first.focus({ preventScroll: true });
    });
    cancel.addEventListener('click', () => setFeedback(false));
})();
