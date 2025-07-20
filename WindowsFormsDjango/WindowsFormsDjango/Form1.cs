using System;
using System.Diagnostics;
using System.Windows.Forms;

namespace WindowsFormsDjango
{
    public partial class Form1 : Form
    {
        private Process _djangoProcess;
        //   private readonly string _djangoProjectPath = @"D:\AlbarakaSystem\server";
         private readonly string _djangoProjectPath = @"D:\MyWeb\AlBarakaFactory\server";

        private readonly string _pythonPath = @"py "; // Or your global python.exe
        private readonly string _djangoPort = "8000";
        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {

        }


        private void StartDjangoServerAsync()
        {
            // Check if paths are valid before attempting to start

            if(_djangoProcess!= null && !_djangoProcess.HasExited)
            {
                MessageBox.Show("Django server is already running.");
                return;
            }

            var processStartInfo = new ProcessStartInfo
            {

                FileName = _pythonPath,
                Arguments = $"manage.py runserver 127.0.0.1:{_djangoPort} --noreload", // --noreload is often better for services
                WorkingDirectory = _djangoProjectPath,
                RedirectStandardOutput = true, // Capture standard output
                RedirectStandardError = true,  // Capture standard error
                UseShellExecute = false,       // Required for redirection
                CreateNoWindow = true,         // Don't create a visible window
            };

            _djangoProcess = new Process { StartInfo = processStartInfo };

            // Event handlers for output and error data

            _djangoProcess.OutputDataReceived += (sender, args) =>
            {
                if (textBox1.InvokeRequired)
                {
                    textBox1.Invoke(new Action(() =>
                    {
                        textBox1.Text += args.Data + Environment.NewLine;
                    }));
                }
                else
                {
                    textBox1.Text += args.Data + Environment.NewLine;
                }
            };
            _djangoProcess.ErrorDataReceived += (sender, args) =>
            {
                if (textBox1.InvokeRequired)
                {
                    textBox1.Invoke(new Action(() =>
                    {
                        textBox1.Text += args.Data + Environment.NewLine;
                    }));
                }
                else
                {
                    textBox1.Text += args.Data + Environment.NewLine;
                }
            };

            try
            {
                _djangoProcess.Start();
                bnStartServer.Enabled = false; // Disable the button to prevent multiple clicks
                btnDisableServer.Enabled = true; // Enable the stop button
                _djangoProcess.BeginOutputReadLine();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error starting Django server: {ex.Message}");
                _djangoProcess.Dispose();
                _djangoProcess = null;
                bnStartServer.Enabled = true; // Disable the button to prevent multiple clicks
                btnDisableServer.Enabled = false; // Disable the stop button

            }
        }

        private void button1_ClickAsync(object sender, EventArgs e)
        {
            StartDjangoServerAsync();
        }

        private void button2_Click(object sender, EventArgs e)
        {
            if (_djangoProcess != null )
            {
                _djangoProcess.Kill();
                _djangoProcess.Close();
                _djangoProcess.Dispose();
                _djangoProcess = null;
                bnStartServer.Enabled = true; // Re-enable the start button
                btnDisableServer.Enabled = false; // Disable the stop button
            }
        }

        private void Form1_FormClosing(object sender, FormClosingEventArgs e)
        {
            e.Cancel = true;
        }

        private void button1_Click(object sender, EventArgs e)
        {
            if (_djangoProcess != null && !_djangoProcess.HasExited)
            {
                this.Text = "Django server is running.";
            }
            else
            {
                this.Text = "Django server is not running.";
            }
        }

        private void timer1_Tick(object sender, EventArgs e)
        {
            timer1.Enabled = false;
            StartDjangoServerAsync();
        }

        private void Form1_FormClosed(object sender, FormClosedEventArgs e)
        {
            button2_Click(null, null);

        }
    }
}
