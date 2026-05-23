import { issuesAPI, getUser } from './api.js';
import { 
  showToast, 
  formatDate, 
  getStatusBadgeClass, 
  getTypeBadgeClass,
  getStatusText,
  getTypeText,
  showLoading 
} from './utils.js';
import { isMaintainer } from './auth.js';

// Load all issues
export const loadIssues = async (filters = {}) => {
  const issuesList = document.getElementById('issuesList');
  if (!issuesList) return;
  
  showLoading('loadingSpinner', true);
  
  try {
    const response = await issuesAPI.getAll(filters);
    
    if (response.success && response.data) {
      displayIssues(response.data);
    } else {
      issuesList.innerHTML = '<div class="text-center text-gray-500 py-8">No issues found</div>';
    }
  } catch (error) {
    showToast('Failed to load issues', 'error');
    issuesList.innerHTML = '<div class="text-center text-red-500 py-8">Error loading issues</div>';
  } finally {
    showLoading('loadingSpinner', false);
  }
};

// Display issues in the list
const displayIssues = (issues) => {
  const issuesList = document.getElementById('issuesList');
  const currentUser = getUser();
  
  if (!issues || issues.length === 0) {
    issuesList.innerHTML = '<div class="text-center text-gray-500 py-8">No issues found</div>';
    return;
  }
  
  issuesList.innerHTML = issues.map(issue => `
    <div class="card hover:shadow-lg transition-shadow">
      <div class="flex justify-between items-start mb-3">
        <div class="flex gap-2">
          <span class="status-badge ${getStatusBadgeClass(issue.status)}">
            ${getStatusText(issue.status)}
          </span>
          <span class="status-badge ${getTypeBadgeClass(issue.type)}">
            ${getTypeText(issue.type)}
          </span>
        </div>
        <div class="flex gap-2">
          ${isMaintainer() ? `
            <button onclick="window.updateIssueStatus(${issue.id}, 'in_progress')" 
                    class="text-blue-600 hover:text-blue-800 text-sm">
              Start
            </button>
            <button onclick="window.updateIssueStatus(${issue.id}, 'resolved')" 
                    class="text-green-600 hover:text-green-800 text-sm">
              Resolve
            </button>
            <button onclick="window.deleteIssue(${issue.id})" 
                    class="text-red-600 hover:text-red-800 text-sm">
              Delete
            </button>
          ` : ''}
          ${!isMaintainer() && currentUser && issue.reporter?.id === currentUser.id && issue.status === 'open' ? `
            <button onclick="window.editIssue(${issue.id})" 
                    class="text-blue-600 hover:text-blue-800 text-sm">
              Edit
            </button>
          ` : ''}
        </div>
      </div>
      
      <h3 class="text-xl font-semibold mb-2">${escapeHtml(issue.title)}</h3>
      <p class="text-gray-600 mb-3">${escapeHtml(issue.description.substring(0, 200))}${issue.description.length > 200 ? '...' : ''}</p>
      
      <div class="flex justify-between items-center text-sm text-gray-500">
        <div>
          <span class="font-medium">Reported by:</span> ${escapeHtml(issue.reporter?.name || 'Unknown')}
          <span class="text-xs">(${escapeHtml(issue.reporter?.role || 'unknown')})</span>
        </div>
        <div>
          <span class="font-medium">Created:</span> ${formatDate(issue.created_at)}
        </div>
      </div>
      
      ${issue.updated_at !== issue.created_at ? `
        <div class="text-xs text-gray-400 mt-2">
          Updated: ${formatDate(issue.updated_at)}
        </div>
      ` : ''}
    </div>
  `).join('');
};

// Helper to escape HTML
const escapeHtml = (text) => {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Create new issue
export const handleCreateIssue = async (event) => {
  event.preventDefault();
  
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const type = document.getElementById('type').value;
  const submitBtn = event.target.querySelector('button[type="submit"]');
  
  showLoading('createSubmit', true);
  
  try {
    const response = await issuesAPI.create({ title, description, type });
    
    if (response.success) {
      showToast('Issue created successfully');
      document.getElementById('createIssueForm').reset();
      
      // Close modal
      closeModal();
      
      // Reload issues
      await loadIssues();
    }
  } catch (error) {
    showToast(error.message || 'Failed to create issue', 'error');
  } finally {
    showLoading('createSubmit', false);
  }
};

// Update issue status
window.updateIssueStatus = async (issueId, status) => {
  try {
    const response = await issuesAPI.updateStatus(issueId, status);
    
    if (response.success) {
      showToast(`Issue status updated to ${status}`);
      await loadIssues();
    }
  } catch (error) {
    showToast(error.message || 'Failed to update status', 'error');
  }
};

// Delete issue
window.deleteIssue = async (issueId) => {
  if (confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
    try {
      const response = await issuesAPI.delete(issueId);
      
      if (response.success) {
        showToast('Issue deleted successfully');
        await loadIssues();
      }
    } catch (error) {
      showToast(error.message || 'Failed to delete issue', 'error');
    }
  }
};

// Edit issue (to be implemented in modal)
window.editIssue = async (issueId) => {
  try {
    const response = await issuesAPI.getById(issueId);
    
    if (response.success) {
      const issue = response.data;
      showEditModal(issue);
    }
  } catch (error) {
    showToast('Failed to load issue details', 'error');
  }
};

// Show edit modal
const showEditModal = (issue) => {
  const modal = document.getElementById('editModal');
  const form = document.getElementById('editIssueForm');
  
  document.getElementById('editTitle').value = issue.title;
  document.getElementById('editDescription').value = issue.description;
  document.getElementById('editType').value = issue.type;
  document.getElementById('editIssueId').value = issue.id;
  
  modal.classList.remove('hidden');
  
  form.onsubmit = async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    
    showLoading('editSubmit', true);
    
    try {
      const updateData = {
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDescription').value,
        type: document.getElementById('editType').value
      };
      
      const response = await issuesAPI.update(issue.id, updateData);
      
      if (response.success) {
        showToast('Issue updated successfully');
        closeModal();
        await loadIssues();
      }
    } catch (error) {
      showToast(error.message || 'Failed to update issue', 'error');
    } finally {
      showLoading('editSubmit', false);
    }
  };
  
  modal.classList.remove('hidden');
};

// Close modal
window.closeModal = () => {
  const createModal = document.getElementById('createModal');
  const editModal = document.getElementById('editModal');
  if (createModal) createModal.classList.add('hidden');
  if (editModal) editModal.classList.add('hidden');
};

// Show create modal
window.showCreateModal = () => {
  const modal = document.getElementById('createModal');
  modal.classList.remove('hidden');
  
  // Reset form
  document.getElementById('createIssueForm').reset();
};

// Apply filters
export const applyFilters = () => {
  const sort = document.getElementById('sort')?.value || 'newest';
  const type = document.getElementById('filterType')?.value || '';
  const status = document.getElementById('filterStatus')?.value || '';
  
  const filters = {};
  if (sort) filters.sort = sort;
  if (type) filters.type = type;
  if (status) filters.status = status;
  
  loadIssues(filters);
};
window.applyFilters = applyFilters;