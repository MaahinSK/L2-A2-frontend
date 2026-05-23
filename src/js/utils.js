// Utility functions

export const showToast = (message, type = 'success') => {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } transition-opacity duration-300`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

export const showLoading = (elementId, loading = true) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  if (loading) {
    element.disabled = true;
    element.innerHTML = '<div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Loading...';
  } else {
    element.disabled = false;
    element.innerHTML = element.getAttribute('data-original-text') || element.innerHTML;
  }
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusBadgeClass = (status) => {
  const classes = {
    'open': 'status-open',
    'in_progress': 'status-in_progress',
    'resolved': 'status-resolved'
  };
  return classes[status] || 'status-open';
};

export const getTypeBadgeClass = (type) => {
  const classes = {
    'bug': 'type-bug',
    'feature_request': 'type-feature_request'
  };
  return classes[type] || 'type-bug';
};

export const getStatusText = (status) => {
  const texts = {
    'open': 'Open',
    'in_progress': 'In Progress',
    'resolved': 'Resolved'
  };
  return texts[status] || status;
};

export const getTypeText = (type) => {
  const texts = {
    'bug': 'Bug',
    'feature_request': 'Feature Request'
  };
  return texts[type] || type;
};