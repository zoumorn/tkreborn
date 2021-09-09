#include <windows.h>

class PlayNode;

int SendKeys(const char* keys, int delay);
PlayNode* ParseExtended(const char*& pref);
PlayNode* SetModifies(BOOL shift, BOOL ctrl, BOOL alt);
PlayNode* Vk2Input(WORD vk, BOOL shift, BOOL ctrl, BOOL alt);
PlayNode* RawChar2Input(const char ch);
WORD FindExtendedVK(const char* extended_key_name_or_char);
PlayNode* ExtendedKey2Input(const char* p);
void SetForegroundWindowInternal(HWND hWnd);
int ParseInt(const char* p, int* buff, int size);

#define CMD_SENDKEYS "SENDKEYS"

#pragma region Extended Key Defination

#define DEFINE_EXTENDED_KEY(name) (DWORD)(void*)#name, VK_##name
DWORD EXTENDED_KEY_NAMES[] = {
    DEFINE_EXTENDED_KEY(BACK      ),  // 0x08
    DEFINE_EXTENDED_KEY(TAB       ),  // 0x09
    DEFINE_EXTENDED_KEY(CLEAR     ),  // 0x0C
    DEFINE_EXTENDED_KEY(RETURN    ),  // 0x0D

    DEFINE_EXTENDED_KEY(PAUSE     ),  // 0x13
    DEFINE_EXTENDED_KEY(CAPITAL   ),  // 0x14

    DEFINE_EXTENDED_KEY(ESCAPE    ),  // 0x1B
    DEFINE_EXTENDED_KEY(CONVERT   ),  // 0x1C
    DEFINE_EXTENDED_KEY(NONCONVERT),  // 0x1D
    DEFINE_EXTENDED_KEY(ACCEPT    ),  // 0x1E
    DEFINE_EXTENDED_KEY(MODECHANGE),  // 0x1F

    DEFINE_EXTENDED_KEY(SPACE     ),  // 0x20
    DEFINE_EXTENDED_KEY(PRIOR     ),  // 0x21
    DEFINE_EXTENDED_KEY(NEXT      ),  // 0x22
    DEFINE_EXTENDED_KEY(END       ),  // 0x23
    DEFINE_EXTENDED_KEY(HOME      ),  // 0x24
    DEFINE_EXTENDED_KEY(LEFT      ),  // 0x25
    DEFINE_EXTENDED_KEY(UP        ),  // 0x26
    DEFINE_EXTENDED_KEY(RIGHT     ),  // 0x27
    DEFINE_EXTENDED_KEY(DOWN      ),  // 0x28
    DEFINE_EXTENDED_KEY(SELECT    ),  // 0x29
    DEFINE_EXTENDED_KEY(PRINT     ),  // 0x2A
    DEFINE_EXTENDED_KEY(EXECUTE   ),  // 0x2B
    DEFINE_EXTENDED_KEY(SNAPSHOT  ),  // 0x2C
    DEFINE_EXTENDED_KEY(INSERT    ),  // 0x2D
    DEFINE_EXTENDED_KEY(DELETE    ),  // 0x2E
    DEFINE_EXTENDED_KEY(HELP      ),  // 0x2F

    DEFINE_EXTENDED_KEY(LWIN      ),  // 0x5B
    DEFINE_EXTENDED_KEY(RWIN      ),  // 0x5C
    DEFINE_EXTENDED_KEY(APPS      ),  // 0x5D

    DEFINE_EXTENDED_KEY(SLEEP     ),  // 0x5F

    DEFINE_EXTENDED_KEY(NUMPAD0   ),  // 0x60
    DEFINE_EXTENDED_KEY(NUMPAD1   ),  // 0x61
    DEFINE_EXTENDED_KEY(NUMPAD2   ),  // 0x62
    DEFINE_EXTENDED_KEY(NUMPAD3   ),  // 0x63
    DEFINE_EXTENDED_KEY(NUMPAD4   ),  // 0x64
    DEFINE_EXTENDED_KEY(NUMPAD5   ),  // 0x65
    DEFINE_EXTENDED_KEY(NUMPAD6   ),  // 0x66
    DEFINE_EXTENDED_KEY(NUMPAD7   ),  // 0x67
    DEFINE_EXTENDED_KEY(NUMPAD8   ),  // 0x68
    DEFINE_EXTENDED_KEY(NUMPAD9   ),  // 0x69
    DEFINE_EXTENDED_KEY(MULTIPLY  ),  // 0x6A
    DEFINE_EXTENDED_KEY(ADD       ),  // 0x6B
    DEFINE_EXTENDED_KEY(SEPARATOR ),  // 0x6C
    DEFINE_EXTENDED_KEY(SUBTRACT  ),  // 0x6D
    DEFINE_EXTENDED_KEY(DECIMAL   ),  // 0x6E
    DEFINE_EXTENDED_KEY(DIVIDE    ),  // 0x6F
    DEFINE_EXTENDED_KEY(F1        ),  // 0x70
    DEFINE_EXTENDED_KEY(F2        ),  // 0x71
    DEFINE_EXTENDED_KEY(F3        ),  // 0x72
    DEFINE_EXTENDED_KEY(F4        ),  // 0x73
    DEFINE_EXTENDED_KEY(F5        ),  // 0x74
    DEFINE_EXTENDED_KEY(F6        ),  // 0x75
    DEFINE_EXTENDED_KEY(F7        ),  // 0x76
    DEFINE_EXTENDED_KEY(F8        ),  // 0x77
    DEFINE_EXTENDED_KEY(F9        ),  // 0x78
    DEFINE_EXTENDED_KEY(F10       ),  // 0x79
    DEFINE_EXTENDED_KEY(F11       ),  // 0x7A
    DEFINE_EXTENDED_KEY(F12       ),  // 0x7B
    DEFINE_EXTENDED_KEY(F13       ),  // 0x7C
    DEFINE_EXTENDED_KEY(F14       ),  // 0x7D
    DEFINE_EXTENDED_KEY(F15       ),  // 0x7E
    DEFINE_EXTENDED_KEY(F16       ),  // 0x7F
    DEFINE_EXTENDED_KEY(F17       ),  // 0x80
    DEFINE_EXTENDED_KEY(F18       ),  // 0x81
    DEFINE_EXTENDED_KEY(F19       ),  // 0x82
    DEFINE_EXTENDED_KEY(F20       ),  // 0x83
    DEFINE_EXTENDED_KEY(F21       ),  // 0x84
    DEFINE_EXTENDED_KEY(F22       ),  // 0x85
    DEFINE_EXTENDED_KEY(F23       ),  // 0x86
    DEFINE_EXTENDED_KEY(F24       )   // 0x87
};

#define EXTENDED_START '{'
#define EXTENDED_END '}'

#define MODIFY_KEY_SHIFT '+'
#define MODIFY_KEY_CTRL '^'
#define MODIFY_KEY_ALT '&'

#define MOUSE_ACTION_CLICK '~'
#define MOUSE_ACTION_DBLCLICK '*'
#define MOUSE_ACTION_DRAGDROP '!'

#pragma endregion

#pragma region PlayNode List Defination

class PlayNode
{
public:
	static const int PNT_INPUT = 1;
	static const int PNT_DELAY = 2;

	int type; // 1: input, 2: delay
	union
	{
		INPUT* input;
		DWORD delay;
	};
	PlayNode* prev;
	PlayNode* next;

	PlayNode(/*input*/);
	PlayNode(int delay);
	~PlayNode();

	static PlayNode* MouseMove(int x, int y);
	static PlayNode* MouseLeftUp();
	static PlayNode* MouseLeftDown();

	static PlayNode* MouseClick(int x, int y);
	static PlayNode* MouseDblClick(int x, int y);
	static PlayNode* MouseDragDrop(int dragX, int dragY, int dropX, int dropY);

	int Length();

	PlayNode* GetHead();
	PlayNode* GetTail();
	void Remove();
	void Join(PlayNode* node);

	static void SaveJoinTail(PlayNode*& prev, PlayNode* node);

};

PlayNode::PlayNode(/*input*/)
{
	type = PNT_INPUT;
	input = new INPUT;
	memset(input, 0, sizeof(INPUT));
	prev = 0;
	next = 0;
}

PlayNode::PlayNode(int delay)
{
	type = PNT_DELAY;
	this->delay = delay;
	prev = 0;
	next = 0;
}

PlayNode::~PlayNode()
{
	if (type == PNT_INPUT) delete input;
}

PlayNode* PlayNode::MouseMove(int x, int y) 
{
	PlayNode* node = new PlayNode();
	node->input->type = INPUT_MOUSE;
	node->input->mi.dwFlags = MOUSEEVENTF_MOVE | MOUSEEVENTF_ABSOLUTE;
	node->input->mi.dx = x*65535 / GetSystemMetrics(SM_CXSCREEN);
	node->input->mi.dy = y*65535 / GetSystemMetrics(SM_CYSCREEN);
	return node;
}
PlayNode* PlayNode::MouseLeftUp()
{
	PlayNode* node = new PlayNode();
	node->input->type = INPUT_MOUSE;
	node->input->mi.dwFlags = MOUSEEVENTF_LEFTUP;
	return node;
}
PlayNode* PlayNode::MouseLeftDown()
{
	PlayNode* node = new PlayNode();
	node->input->type = INPUT_MOUSE;
	node->input->mi.dwFlags = MOUSEEVENTF_LEFTDOWN;
	return node;
}

PlayNode* PlayNode::MouseClick(int x, int y)
{
	PlayNode* head = 0;
	PlayNode::SaveJoinTail(head, MouseMove(x, y));
	PlayNode::SaveJoinTail(head, MouseLeftDown());
	PlayNode::SaveJoinTail(head, MouseLeftUp());
	return head;
}
PlayNode* PlayNode::MouseDblClick(int x, int y)
{
	PlayNode* head = 0;
	PlayNode::SaveJoinTail(head, MouseMove(x, y));
	PlayNode::SaveJoinTail(head, MouseLeftDown());
	PlayNode::SaveJoinTail(head, MouseLeftUp());
	PlayNode::SaveJoinTail(head, MouseLeftDown());
	PlayNode::SaveJoinTail(head, MouseLeftUp());
	return head;
}
PlayNode* PlayNode::MouseDragDrop(int dragX, int dragY, int dropX, int dropY)
{
	PlayNode* head = 0;
	PlayNode::SaveJoinTail(head, MouseMove(dragX, dragY));
	PlayNode::SaveJoinTail(head, MouseLeftDown());
	PlayNode::SaveJoinTail(head, MouseMove(dropX, dropY));
	PlayNode::SaveJoinTail(head, MouseLeftUp());
	return head;
}

int PlayNode::Length()
{
	int n = 1;
	PlayNode* p = this;
	while (p->next) 
	{
		n++;
		p = p->next;
	}
	return n;
}

PlayNode* PlayNode::GetHead()
{
	PlayNode* p = this;
	while (p->prev) p = p->prev;
	return p;
}

PlayNode* PlayNode::GetTail()
{
	PlayNode* p = this;
	while (p->next) p = p->next;
	return p;
}

void PlayNode::Remove()
{
	if (prev) prev->next = next;
	if (next) next->prev = prev;
	prev = 0;
	next = 0;
}

void PlayNode::Join(PlayNode* node)
{
	next = node;
	node->prev = this;
}

void PlayNode::SaveJoinTail(PlayNode*& prev, PlayNode* node)
{
	if (node == 0) return;
	if (prev == 0)
	{
		prev = node;
		return;
	}
	prev->GetTail()->Join(node);
}

#pragma endregion

BOOL g_shift_state = 0;
BOOL g_ctrl_state = 0;
BOOL g_alt_state = 0;

int main(int argc, const char** argv)
{
    if (argc < 2) return -1;
    
    const char* cmd = argv[1];
    
    //simulator SENDKEYS hwnd keys
    if (strcmp(cmd, CMD_SENDKEYS) == 0)
    {
        if (argc != 4 && argc != 5) return -2;
        HWND hwnd = (HWND)atoi(argv[2]);
		if (!IsWindow(hwnd)) return -3;
		const char* keys = 0;
		int delay = 50;
		if (argc == 5)
		{
			delay = atoi(argv[3]);
			keys = argv[4];
		}
		else
		{
			keys = argv[3];
		}
		SetForegroundWindowInternal(hwnd);
		return SendKeys(keys, delay);
    }
    
    return 0;
}

void SetForegroundWindowInternal(HWND hWnd)
{
	if (!IsWindow(hWnd)) return;

	//relation time of SetForegroundWindow lock
	DWORD lockTimeOut = 0;
	HWND  hCurrWnd = GetForegroundWindow();
	DWORD dwCurrTID = GetWindowThreadProcessId(hCurrWnd, 0);

	DWORD dwThisTID = GetCurrentThreadId();
	//we need to bypass some limitations from Microsoft :)
	if (dwThisTID != dwCurrTID)
	{
		AttachThreadInput(dwThisTID, dwCurrTID, TRUE);

		SystemParametersInfo(SPI_GETFOREGROUNDLOCKTIMEOUT, 0, &lockTimeOut, 0);
		SystemParametersInfo(SPI_SETFOREGROUNDLOCKTIMEOUT, 0, 0, SPIF_SENDWININICHANGE | SPIF_UPDATEINIFILE);

		AllowSetForegroundWindow(ASFW_ANY);
	}

	SetForegroundWindow(hWnd);

	if (dwThisTID != dwCurrTID)
	{
		SystemParametersInfo(SPI_SETFOREGROUNDLOCKTIMEOUT, 0, (PVOID)lockTimeOut, SPIF_SENDWININICHANGE | SPIF_UPDATEINIFILE);
		AttachThreadInput(dwThisTID, dwCurrTID, FALSE);
	}
}

int SendKeys(const char* keys, int delay)
{
	PlayNode* head = 0;
	int total_keys = 0;

	const char* p = keys;
	while (*p)
	{
		PlayNode* extended = ParseExtended(p);
		if (extended)
		{
			PlayNode::SaveJoinTail(head, extended);
			if (extended->type == PlayNode::PNT_INPUT) //extra delay
				PlayNode::SaveJoinTail(head, new PlayNode(delay));
			total_keys++;
			continue;
		}

		PlayNode* rawchar = RawChar2Input(*p);
		PlayNode::SaveJoinTail(head, rawchar);
		PlayNode::SaveJoinTail(head, new PlayNode(delay));
		total_keys++;

		p++;
	}

	if (!head) return total_keys;

	//remove last delay
	PlayNode* tail = head->GetTail();
	if (tail->type == PlayNode::PNT_DELAY)
	{
		tail->Remove();
		delete tail;
	}

	PlayNode::SaveJoinTail(head, SetModifies(0, 0, 0));

	// reset keyboard state
	BYTE kb[256] = { 0 };
	SetKeyboardState(kb);

	// play & clean up
	PlayNode* play = head;
	while (play)
	{
		if (play->type == PlayNode::PNT_INPUT)
			SendInput(1, play->input, sizeof(INPUT));
		else if (play->type == PlayNode::PNT_DELAY)
			Sleep(play->delay);
		PlayNode* play_to_delete = play;
		play = play->next;
		delete play_to_delete;
	}

	return total_keys;
}

PlayNode* ParseExtended(const char*& pref)
{
	if (*pref != EXTENDED_START) return 0;
	//find extended key end
	const char* p_extended_key_end = pref + 1;
	while (*p_extended_key_end)
	{
		if (*p_extended_key_end == EXTENDED_END) break;
		p_extended_key_end++;
	}
	//found & avaliable
	int extended_key_len = p_extended_key_end - pref - 1;
	if (*p_extended_key_end == 0 || extended_key_len <= 0) return 0;

	char* extended_key = new char[extended_key_len + 1];
	strncpy_s(extended_key, extended_key_len + 1, pref + 1, extended_key_len);

	if (isdigit(*extended_key))
	{//delay
		int dl = atoi(extended_key);
		pref = p_extended_key_end + 1;
		return new PlayNode(dl);
	}
	else if (*extended_key == MODIFY_KEY_SHIFT ||
		*extended_key == MODIFY_KEY_CTRL ||
		*extended_key == MODIFY_KEY_ALT)
	{//extended key
		PlayNode* inputs = ExtendedKey2Input(extended_key);
		if (inputs)
		{
			pref = p_extended_key_end + 1;
			return inputs;
		}
	}
	else if (*extended_key == MOUSE_ACTION_CLICK)
	{//mouse click
		int pos[2] = { 0 };
		if (ParseInt(extended_key + 1, pos, 2) == 2)
		{
			pref = p_extended_key_end + 1;
			return PlayNode::MouseClick(pos[0], pos[1]);
		}
	}
	else if (*extended_key == MOUSE_ACTION_DBLCLICK)
	{//mouse double click
		int pos[2] = { 0 };
		if (ParseInt(extended_key + 1, pos, 2) == 2)
		{
			pref = p_extended_key_end + 1;
			return PlayNode::MouseDblClick(pos[0], pos[1]);
		}
	}
	else if (*extended_key == MOUSE_ACTION_DRAGDROP)
	{//mouse drag & drop
		int pos[4] = { 0 };
		if (ParseInt(extended_key + 1, pos, 4) == 4)
		{
			pref = p_extended_key_end + 1;
			return PlayNode::MouseDragDrop(pos[0], pos[1], pos[2], pos[3]);
		}
	}

	return 0;
}

PlayNode* SetModifies(BOOL shift, BOOL ctrl, BOOL alt)
{
	PlayNode* head = 0;
	if (shift != g_shift_state)
	{
		PlayNode* node = new PlayNode();
		node->input->type = INPUT_KEYBOARD;
		node->input->ki.wVk = VK_SHIFT;
		if (!shift)
			node->input->ki.dwFlags = KEYEVENTF_KEYUP;
		PlayNode::SaveJoinTail(head, node);
		g_shift_state = shift;
	}
	if (ctrl != g_ctrl_state)
	{
		PlayNode* node = new PlayNode();
		node->input->type = INPUT_KEYBOARD;
		node->input->ki.wVk = VK_CONTROL;
		if (!ctrl)
			node->input->ki.dwFlags = KEYEVENTF_KEYUP;
		PlayNode::SaveJoinTail(head, node);
		g_ctrl_state = ctrl;
	}
	if (alt != g_alt_state)
	{
		PlayNode* node = new PlayNode();
		node->input->type = INPUT_KEYBOARD;
		node->input->ki.wVk = VK_MENU;
		if (!ctrl)
			node->input->ki.dwFlags = KEYEVENTF_KEYUP;
		PlayNode::SaveJoinTail(head, node);
		g_alt_state = alt;
	}
	return head;
}

PlayNode* Vk2Input(WORD vk, BOOL shift, BOOL ctrl, BOOL alt)
{
	PlayNode* head = 0;
	PlayNode::SaveJoinTail(head, SetModifies(shift, ctrl, alt));
	if (vk)
	{
		PlayNode* node = new PlayNode();
		node->input->type = INPUT_KEYBOARD;
		node->input->ki.wVk = vk;
		PlayNode::SaveJoinTail(head, node);

		node = new PlayNode();
		node->input->type = INPUT_KEYBOARD;
		node->input->ki.wVk = vk;
		node->input->ki.dwFlags = KEYEVENTF_KEYUP;
		PlayNode::SaveJoinTail(head, node);
	}
	return head;
}

PlayNode* RawChar2Input(const char ch)
{
    SHORT ret = VkKeyScan(ch);
    WORD vk = ret & 0xFF;
    
    WORD states = (ret & 0xFF00) >> 8;
    BOOL shift = states & 0x01;
    BOOL ctrl = (states & 0x02) >> 1;
    BOOL alt = (states & 0x04) >> 2;
    
	return Vk2Input(vk, shift, ctrl, alt);
}

WORD FindExtendedVK(const char* extended_key_name_or_char)
{
	if (*extended_key_name_or_char == 0) //without any key
		return 0;

	if (extended_key_name_or_char[1] == 0) //char
	{
		SHORT ret = VkKeyScan(*extended_key_name_or_char);
		return ret & 0xFF;
	}

	int n_extended_keys = (sizeof(EXTENDED_KEY_NAMES) / sizeof(DWORD)) / 2;
	for (int i = 0; i < n_extended_keys; i++)
	{
		if (strcmp(extended_key_name_or_char, (const char*)EXTENDED_KEY_NAMES[i * 2]) == 0)
		{
			return (WORD)EXTENDED_KEY_NAMES[i * 2 + 1];
			break;
		}
	}

	return 0;
}

PlayNode* ExtendedKey2Input(const char* p)
{
	BOOL shift = 0;
	BOOL ctrl = 0;
	BOOL alt = 0;
	while (*p)
	{
		if (*p == MODIFY_KEY_SHIFT) { shift = 1; p++; }
		else if (*p == MODIFY_KEY_CTRL) { ctrl = 1; p++; }
		else if (*p == MODIFY_KEY_ALT) { alt = 1; p++; }
		else { break; }
	}

	WORD vk = FindExtendedVK(p);
	return Vk2Input(vk, shift, ctrl, alt);
}

int ParseInt(const char* p, int* buff, int size)
{
	const char SP = ',';
	int n = 0;
	do
	{
		if (!isdigit(*p)) break;
		int val = 0;
		while (*p >= '0' && *p <= '9')
		{
			val = val * 10 + (*p - '0');
			p++;
		}
		buff[n++] = val;
		if (*p != SP || n >= size) break;
		p++;
	} while (true);
	return n;
}
