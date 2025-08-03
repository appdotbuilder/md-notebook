
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Moon, Sun, Plus, Edit, Trash2, FileText, Calendar } from 'lucide-react';
import type { Note, CreateNoteInput, UpdateNoteInput } from '../../server/src/schema';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form state for creating notes
  const [createFormData, setCreateFormData] = useState<CreateNoteInput>({
    title: '',
    content: ''
  });

  // Form state for editing notes
  const [editFormData, setEditFormData] = useState<UpdateNoteInput>({
    id: 0,
    title: '',
    content: ''
  });

  // Load notes from server
  const loadNotes = useCallback(async () => {
    try {
      const result = await trpc.getNotes.query();
      setNotes(result);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Handle note creation
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.title.trim()) return;

    setIsLoading(true);
    try {
      const newNote = await trpc.createNote.mutate(createFormData);
      setNotes((prev: Note[]) => [newNote, ...prev]);
      setCreateFormData({ title: '', content: '' });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle note editing
  const handleEditNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.title?.trim() || !editingNote) return;

    setIsLoading(true);
    try {
      const updatedNote = await trpc.updateNote.mutate(editFormData);
      if (updatedNote) {
        setNotes((prev: Note[]) => 
          prev.map((note: Note) => note.id === updatedNote.id ? updatedNote : note)
        );
        if (selectedNote?.id === updatedNote.id) {
          setSelectedNote(updatedNote);
        }
      }
      setIsEditDialogOpen(false);
      setEditingNote(null);
    } catch (error) {
      console.error('Failed to update note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle note deletion
  const handleDeleteNote = async (noteId: number) => {
    setIsLoading(true);
    try {
      const result = await trpc.deleteNote.mutate({ id: noteId });
      if (result.success) {
        setNotes((prev: Note[]) => prev.filter((note: Note) => note.id !== noteId));
        if (selectedNote?.id === noteId) {
          setSelectedNote(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (note: Note) => {
    setEditingNote(note);
    setEditFormData({
      id: note.id,
      title: note.title,
      content: note.content
    });
    setIsEditDialogOpen(true);
  };

  // Render markdown as simple formatted text (basic implementation)
  const renderMarkdown = (content: string) => {
    return content
      .split('\n')
      .map((line: string, index: number) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-semibold mt-3 mb-2">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-medium mt-2 mb-1">{line.slice(4)}</h3>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="mb-2">{line}</p>;
      });
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">📝 Markdown Notebook</h1>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Note
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Note</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateNote} className="space-y-4">
                  <Input
                    placeholder="Note title"
                    value={createFormData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCreateFormData((prev: CreateNoteInput) => ({ ...prev, title: e.target.value }))
                    }
                    required
                  />
                  <Textarea
                    placeholder="Write your markdown content here..."
                    value={createFormData.content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setCreateFormData((prev: CreateNoteInput) => ({ ...prev, content: e.target.value }))
                    }
                    rows={10}
                    className="font-mono"
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create Note'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleDarkMode}
              className="ml-2"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notes List */}
          <div className="lg:col-span-1">
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} h-fit`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Your Notes ({notes.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {notes.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No notes yet. Create your first note!</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notes.map((note: Note) => (
                      <div
                        key={note.id}
                        className={`p-4 cursor-pointer transition-colors border-l-4 ${
                          selectedNote?.id === note.id
                            ? 'bg-blue-50 border-l-blue-500 dark:bg-blue-900/20 dark:border-l-blue-400'
                            : 'hover:bg-gray-50 border-l-transparent dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setSelectedNote(note)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{note.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {note.content.split('\n')[0] || 'No content'}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-400">
                                {note.updated_at.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                openEditDialog(note);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Note</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{note.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Note Viewer */}
          <div className="lg:col-span-2">
            <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} min-h-[600px]`}>
              {selectedNote ? (
                <>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">{selectedNote.title}</CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <Badge variant="secondary" className="text-xs">
                            Created: {selectedNote.created_at.toLocaleDateString()}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Updated: {selectedNote.updated_at.toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(selectedNote)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-6">
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      {selectedNote.content ? (
                        renderMarkdown(selectedNote.content)
                      ) : (
                        <p className="text-gray-500 italic">This note is empty.</p>
                      )}
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No note selected</h3>
                    <p>Select a note from the list to view its content</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditNote} className="space-y-4">
              <Input
                placeholder="Note title"
                value={editFormData.title || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditFormData((prev: UpdateNoteInput) => ({ ...prev, title: e.target.value }))
                }
                required
              />
              <Textarea
                placeholder="Write your markdown content here..."
                value={editFormData.content || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditFormData((prev: UpdateNoteInput) => ({ ...prev, content: e.target.value }))
                }
                rows={10}
                className="font-mono"
              />
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default App;
