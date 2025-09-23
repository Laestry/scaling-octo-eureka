<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let firstName = '';
  let lastName = '';
  let email = '';
  let isSubmitting = false;
  let errors = {
    firstName: '',
    lastName: '',
    email: ''
  };

  function validateForm() {
    const newErrors = {
      firstName: '',
      lastName: '',
      email: ''
    };

    let isValid = true;

    if (!firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
      isValid = false;
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = 'L\'adresse e-mail est requise';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Veuillez entrer une adresse e-mail valide';
      isValid = false;
    }

    errors = newErrors;
    return isValid;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    isSubmitting = true;

    try {
      dispatch('submit', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim()
      });

      // Reset form
      firstName = '';
      lastName = '';
      email = '';
      errors = { firstName: '', lastName: '', email: '' };

    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      isSubmitting = false;
    }
  }

  function handleDecline() {
    dispatch('decline');
  }

  function handleClose() {
    dispatch('close');
  }

  // Clear individual field errors when user starts typing
  $: if (firstName) errors.firstName = '';
  $: if (lastName) errors.lastName = '';
  $: if (email) errors.email = '';
</script>

<!-- Modal overlay -->
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50" style="padding-top: 588px; padding-left: 205px;" on:click={handleClose}>
  <!-- Modal content -->
  <div class="bg-white shadow-lg p-6 w-full max-w-md mx-4 relative" on:click|stopPropagation>
    
    <!-- Close button -->
    <button 
      on:click={handleClose}
      class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-light"
      type="button"
    >
      ×
    </button>

    <!-- Header text -->
    <div class="mb-6 pr-8">
      <p class="text-[#3777BC] font-riposte text-sm leading-relaxed">
        Inscrivez-vous et recevez un rappel lorsque ce produit sera disponible :
      </p>
    </div>

    <!-- Form -->
    <form on:submit={handleSubmit} class="space-y-4">
      
      <!-- First and Last name row -->
      <div class="flex gap-2">
        <input
          type="text"
          bind:value={firstName}
          placeholder="Prénom"
          class="flex-1 px-2 py-2 rounded-full border border-[#3777BC] text-center text-sm font-riposte placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3777BC] focus:ring-opacity-50 min-w-0"
        />
        <input
          type="text"
          bind:value={lastName}
          placeholder="Nom"
          class="flex-1 px-2 py-2 rounded-full border border-[#3777BC] text-center text-sm font-riposte placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3777BC] focus:ring-opacity-50 min-w-0"
        />
      </div>

      <!-- Email input -->
      <div>
        <input
          type="email"
          bind:value={email}
          placeholder="Courriel"
          class="w-full px-3 py-2 rounded-full border border-[#3777BC] text-center text-sm font-riposte placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3777BC] focus:ring-opacity-50"
        />
      </div>

      <!-- Buttons row -->
      <div class="flex items-center justify-between pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          class="bg-[#3777BC] text-white px-6 py-2 rounded-full text-sm font-riposte hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Envoi...' : "J'ai hâte!"}
        </button>
        
        <button
          type="button"
          on:click={handleDecline}
          class="text-gray-400 text-sm font-riposte underline hover:text-gray-600 transition-colors"
        >
          Non, merci!
        </button>
      </div>

      <!-- Error messages -->
      {#if errors.firstName || errors.lastName || errors.email}
        <div class="mt-3 text-red-600 text-xs font-riposte">
          {#if errors.firstName}<p>{errors.firstName}</p>{/if}
          {#if errors.lastName}<p>{errors.lastName}</p>{/if}
          {#if errors.email}<p>{errors.email}</p>{/if}
        </div>
      {/if}
      
    </form>
  </div>
</div>

